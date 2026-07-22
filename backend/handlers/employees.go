package handlers

import (
	"net/http"

	"kayulog/backend/database"
	"kayulog/backend/models"

	"github.com/gorilla/mux"
)

// GetEmployees returns all users with role 'user'
func GetEmployees(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT u.id, u.username, u.name, u.role,
		       COALESCE(exp.total, 0) as total_expenses,
		       l.updated_at
		FROM users u
		LEFT JOIN (SELECT user_id, SUM(amount) as total FROM expenses GROUP BY user_id) exp ON u.id = exp.user_id
		LEFT JOIN locations l ON u.id = l.user_id
		WHERE u.role = 'user'
		ORDER BY u.name`)
	if err != nil {
		jsonError(w, "Gagal mengambil data karyawan", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type EmployeeInfo struct {
		models.User
		TotalExpenses float64 `json:"total_expenses"`
		LocationTS    *int64  `json:"location_ts"`
	}

	employees := []EmployeeInfo{}
	for rows.Next() {
		var e EmployeeInfo
		var locTS *int64
		rows.Scan(&e.ID, &e.Username, &e.Name, &e.Role, &e.TotalExpenses, &locTS)
		e.LocationTS = locTS
		employees = append(employees, e)
	}

	jsonResponse(w, employees)
}

// DeleteEmployee removes an employee account (admin only)
func DeleteEmployee(w http.ResponseWriter, r *http.Request) {
	username := mux.Vars(r)["username"]

	var role string
	err := database.DB.QueryRow("SELECT role FROM users WHERE username = $1", username).Scan(&role)
	if err != nil {
		jsonError(w, "Karyawan tidak ditemukan", http.StatusNotFound)
		return
	}
	if role == "admin" {
		jsonError(w, "Tidak bisa menghapus admin", http.StatusForbidden)
		return
	}

	_, err = database.DB.Exec("DELETE FROM users WHERE username = $1 AND role = 'user'", username)
	if err != nil {
		jsonError(w, "Gagal menghapus karyawan", http.StatusInternalServerError)
		return
	}

	jsonResponse(w, map[string]string{"message": "Karyawan dihapus dari daftar"})
}
