package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"kayulog-backend/database"
	"kayulog-backend/models"

	"github.com/gorilla/mux"
)

// GetSales returns all wood sale records
func GetSales(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT s.id, s.company, s.amount, COALESCE(s.volume,''), COALESCE(s.note,''),
		       s.date, s.user_id, u.name, s.created_at
		FROM sales s
		LEFT JOIN users u ON s.user_id = u.id
		ORDER BY s.created_at DESC`)
	if err != nil {
		jsonError(w, "Gagal mengambil data penjualan", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	sales := []models.Sale{}
	for rows.Next() {
		var s models.Sale
		var dateTime time.Time
		var userID sql.NullInt64
		var empName sql.NullString

		err := rows.Scan(&s.ID, &s.Company, &s.Amount, &s.Volume, &s.Note,
			&dateTime, &userID, &empName, &s.CreatedAt)
		if err != nil {
			continue
		}
		s.Date = dateTime.Format("2006-01-02")
		if userID.Valid {
			uid := int(userID.Int64)
			s.UserID = &uid
		}
		if empName.Valid {
			s.EmpName = &empName.String
		}
		sales = append(sales, s)
	}

	jsonResponse(w, sales)
}

// CreateSale records a new wood sale transaction (admin only)
func CreateSale(w http.ResponseWriter, r *http.Request) {
	var req models.SaleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Data tidak valid", http.StatusBadRequest)
		return
	}

	if req.Company == "" {
		jsonError(w, "Nama perusahaan pembeli wajib diisi", http.StatusBadRequest)
		return
	}
	if req.Amount <= 0 {
		jsonError(w, "Masukkan jumlah penjualan yang valid", http.StatusBadRequest)
		return
	}
	if req.Date == "" {
		req.Date = time.Now().Format("2006-01-02")
	}

	var userID *int
	if req.Username != "" && req.Username != "none" {
		var uid int
		err := database.DB.QueryRow("SELECT id FROM users WHERE username = $1", req.Username).Scan(&uid)
		if err == nil {
			userID = &uid
		}
	}

	var id int
	err := database.DB.QueryRow(
		"INSERT INTO sales (company, amount, volume, note, date, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
		req.Company, req.Amount, req.Volume, req.Note, req.Date, userID,
	).Scan(&id)
	if err != nil {
		jsonError(w, "Gagal menyimpan penjualan", http.StatusInternalServerError)
		return
	}

	jsonResponse(w, map[string]interface{}{
		"id":      id,
		"message": "Penjualan kayu tercatat",
	})
}

// DeleteSale removes a sale record (admin only)
func DeleteSale(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	database.DB.Exec("DELETE FROM sales WHERE id = $1", id)
	jsonResponse(w, map[string]string{"message": "Catatan penjualan dihapus"})
}
