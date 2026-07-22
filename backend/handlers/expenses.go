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

// GetExpenses returns all expenses (admin) or own expenses (user)
func GetExpenses(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaims(r)

	var query string
	var args []interface{}

	if claims.Role == "admin" {
		query = `
			SELECT e.id, e.user_id, u.username, u.name, e.category_key, e.amount,
			       COALESCE(e.note,''), e.date, e.created_at
			FROM expenses e
			JOIN users u ON e.user_id = u.id
			ORDER BY e.created_at DESC`
	} else {
		query = `
			SELECT e.id, e.user_id, u.username, u.name, e.category_key, e.amount,
			       COALESCE(e.note,''), e.date, e.created_at
			FROM expenses e
			JOIN users u ON e.user_id = u.id
			WHERE e.user_id = $1
			ORDER BY e.created_at DESC`
		args = append(args, claims.UserID)
	}

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		jsonError(w, "Gagal mengambil data pengeluaran", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	expenses := []models.Expense{}
	for rows.Next() {
		var e models.Expense
		var dateTime time.Time
		err := rows.Scan(&e.ID, &e.UserID, &e.Username, &e.Name, &e.CategoryKey,
			&e.Amount, &e.Note, &dateTime, &e.CreatedAt)
		if err != nil {
			continue
		}
		e.Date = dateTime.Format("2006-01-02")
		expenses = append(expenses, e)
	}

	jsonResponse(w, expenses)
}

// CreateExpense adds a new expense for the current user
func CreateExpense(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaims(r)

	var req models.ExpenseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Data tidak valid", http.StatusBadRequest)
		return
	}

	if req.CategoryKey == "" {
		jsonError(w, "Pilih kategori pengeluaran", http.StatusBadRequest)
		return
	}
	if req.Amount <= 0 {
		jsonError(w, "Masukkan jumlah yang valid", http.StatusBadRequest)
		return
	}
	if req.Date == "" {
		req.Date = time.Now().Format("2006-01-02")
	}

	var id int
	err := database.DB.QueryRow(
		"INSERT INTO expenses (user_id, category_key, amount, note, date) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		claims.UserID, req.CategoryKey, req.Amount, req.Note, req.Date,
	).Scan(&id)
	if err != nil {
		jsonError(w, "Gagal menyimpan pengeluaran", http.StatusInternalServerError)
		return
	}

	jsonResponse(w, map[string]interface{}{
		"id":      id,
		"message": "Pengeluaran tercatat",
	})
}

// DeleteExpense removes an expense record
func DeleteExpense(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaims(r)
	id, _ := strconv.Atoi(mux.Vars(r)["id"])

	if claims.Role == "admin" {
		database.DB.Exec("DELETE FROM expenses WHERE id = $1", id)
	} else {
		database.DB.Exec("DELETE FROM expenses WHERE id = $1 AND user_id = $2", id, claims.UserID)
	}

	jsonResponse(w, map[string]string{"message": "Catatan dihapus"})
}
