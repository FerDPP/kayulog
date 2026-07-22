package handlers

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"kayulog-backend/database"
	"kayulog-backend/models"

	"github.com/gorilla/mux"
)

// GetCategories returns all expense categories
func GetCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`SELECT id, "key", label, icon_key FROM categories ORDER BY id`)
	if err != nil {
		jsonError(w, "Gagal mengambil kategori", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	categories := []models.Category{}
	for rows.Next() {
		var c models.Category
		rows.Scan(&c.ID, &c.Key, &c.Label, &c.IconKey)
		categories = append(categories, c)
	}

	jsonResponse(w, categories)
}

// CreateCategory adds a new expense category (admin only)
func CreateCategory(w http.ResponseWriter, r *http.Request) {
	var req models.CategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Data tidak valid", http.StatusBadRequest)
		return
	}

	if req.Label == "" {
		jsonError(w, "Nama kategori tidak boleh kosong", http.StatusBadRequest)
		return
	}
	if req.IconKey == "" {
		req.IconKey = "lainnya"
	}

	key := slugify(req.Label)

	var count int
	database.DB.QueryRow(`SELECT COUNT(*) FROM categories WHERE "key" = $1`, key).Scan(&count)
	if count > 0 {
		n := 2
		for {
			candidate := key + "-" + strconv.Itoa(n)
			database.DB.QueryRow(`SELECT COUNT(*) FROM categories WHERE "key" = $1`, candidate).Scan(&count)
			if count == 0 {
				key = candidate
				break
			}
			n++
		}
	}

	var id int
	err := database.DB.QueryRow(
		`INSERT INTO categories ("key", label, icon_key) VALUES ($1, $2, $3) RETURNING id`,
		key, req.Label, req.IconKey,
	).Scan(&id)
	if err != nil {
		jsonError(w, "Gagal menambahkan kategori", http.StatusInternalServerError)
		return
	}

	jsonResponse(w, models.Category{
		ID:      id,
		Key:     key,
		Label:   req.Label,
		IconKey: req.IconKey,
	})
}

// DeleteCategory removes a category by key (admin only)
func DeleteCategory(w http.ResponseWriter, r *http.Request) {
	key := mux.Vars(r)["key"]

	_, err := database.DB.Exec(`DELETE FROM categories WHERE "key" = $1`, key)
	if err != nil {
		jsonError(w, "Gagal menghapus kategori", http.StatusInternalServerError)
		return
	}

	jsonResponse(w, map[string]string{"message": "Kategori dihapus"})
}

func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	s = reg.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	if s == "" {
		return "kategori"
	}
	return s
}
