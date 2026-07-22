package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"kayulog/backend/database"
	"kayulog/backend/middleware"
	"kayulog/backend/models"

	"github.com/gorilla/mux"
)

// GetCapital returns capital records - admin sees all, user sees own
func GetCapital(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaims(r)

	var query string
	var args []interface{}

	if claims.Role == "admin" {
		query = `
			SELECT c.id, c.user_id, u.username, u.name, c.amount,
			       COALESCE(c.note,''), c.date, c.created_at
			FROM capital c
			JOIN users u ON c.user_id = u.id
			ORDER BY c.created_at DESC`
	} else {
		query = `
			SELECT c.id, c.user_id, u.username, u.name, c.amount,
			       COALESCE(c.note,''), c.date, c.created_at
			FROM capital c
			JOIN users u ON c.user_id = u.id
			WHERE c.user_id = $1
			ORDER BY c.created_at DESC`
		args = append(args, claims.UserID)
	}

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		jsonError(w, "Gagal mengambil data modal", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	capitals := []models.Capital{}
	for rows.Next() {
		var c models.Capital
		var dateTime time.Time
		err := rows.Scan(&c.ID, &c.UserID, &c.Username, &c.Name, &c.Amount,
			&c.Note, &dateTime, &c.CreatedAt)
		if err != nil {
			continue
		}
		c.Date = dateTime.Format("2006-01-02")
		capitals = append(capitals, c)
	}

	jsonResponse(w, capitals)
}

// CreateCapital records capital given to an employee (admin only)
func CreateCapital(w http.ResponseWriter, r *http.Request) {
	var req models.CapitalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Data tidak valid", http.StatusBadRequest)
		return
	}

	if req.Username == "" {
		jsonError(w, "Pilih karyawan penerima modal", http.StatusBadRequest)
		return
	}
	if req.Amount <= 0 {
		jsonError(w, "Masukkan jumlah modal yang valid", http.StatusBadRequest)
		return
	}
	if req.Date == "" {
		req.Date = time.Now().Format("2006-01-02")
	}

	var userID int
	err := database.DB.QueryRow("SELECT id FROM users WHERE username = $1", req.Username).Scan(&userID)
	if err != nil {
		jsonError(w, "Karyawan tidak ditemukan", http.StatusNotFound)
		return
	}

	var id int
	err = database.DB.QueryRow(
		"INSERT INTO capital (user_id, amount, note, date) VALUES ($1, $2, $3, $4) RETURNING id",
		userID, req.Amount, req.Note, req.Date,
	).Scan(&id)
	if err != nil {
		jsonError(w, "Gagal menyimpan modal", http.StatusInternalServerError)
		return
	}

	jsonResponse(w, map[string]interface{}{
		"id":      id,
		"message": "Modal dicatat",
	})
}

// DeleteCapital removes a capital record (admin only)
func DeleteCapital(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	database.DB.Exec("DELETE FROM capital WHERE id = $1", id)
	jsonResponse(w, map[string]string{"message": "Catatan modal dihapus"})
}

// GetCapitalSummary returns per-employee capital vs spending summary
func GetCapitalSummary(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT u.id, u.username, u.name, u.role,
		       COALESCE(cap.total, 0) as total_capital,
		       COALESCE(exp.total, 0) as total_spent
		FROM users u
		LEFT JOIN (SELECT user_id, SUM(amount) as total FROM capital GROUP BY user_id) cap ON u.id = cap.user_id
		LEFT JOIN (SELECT user_id, SUM(amount) as total FROM expenses GROUP BY user_id) exp ON u.id = exp.user_id
		WHERE u.role = 'user'
		ORDER BY u.name`)
	if err != nil {
		jsonError(w, "Gagal mengambil ringkasan modal", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	summaries := []models.EmployeeSummary{}
	for rows.Next() {
		var s models.EmployeeSummary
		rows.Scan(&s.User.ID, &s.User.Username, &s.User.Name, &s.User.Role,
			&s.TotalCapital, &s.TotalSpent)
		s.Remaining = s.TotalCapital - s.TotalSpent
		summaries = append(summaries, s)
	}

	jsonResponse(w, summaries)
}
