package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"kayulog/backend/database"
	"kayulog/backend/middleware"
	"kayulog/backend/models"
)

// GetLocations returns all employee locations (admin) or own location (user)
func GetLocations(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaims(r)

	var query string
	var args []interface{}

	if claims.Role == "admin" {
		query = `
			SELECT l.user_id, u.username, u.name, l.lat, l.lng, l.accuracy, l.updated_at
			FROM locations l
			JOIN users u ON l.user_id = u.id
			WHERE u.role = 'user'`
	} else {
		query = `
			SELECT l.user_id, u.username, u.name, l.lat, l.lng, l.accuracy, l.updated_at
			FROM locations l
			JOIN users u ON l.user_id = u.id
			WHERE l.user_id = $1`
		args = append(args, claims.UserID)
	}

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		jsonError(w, "Gagal mengambil data lokasi", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	locations := []models.Location{}
	for rows.Next() {
		var l models.Location
		rows.Scan(&l.UserID, &l.Username, &l.Name, &l.Lat, &l.Lng, &l.Accuracy, &l.UpdatedAt)
		locations = append(locations, l)
	}

	jsonResponse(w, locations)
}

// UpdateLocation saves or updates the current user's GPS position
func UpdateLocation(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaims(r)

	var req models.LocationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Data lokasi tidak valid", http.StatusBadRequest)
		return
	}

	ts := time.Now().UnixMilli()

	_, err := database.DB.Exec(`
		INSERT INTO locations (user_id, lat, lng, accuracy, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id) DO UPDATE SET lat=$2, lng=$3, accuracy=$4, updated_at=$5`,
		claims.UserID, req.Lat, req.Lng, req.Accuracy, ts,
	)

	if err != nil {
		jsonError(w, "Gagal menyimpan lokasi", http.StatusInternalServerError)
		return
	}

	jsonResponse(w, map[string]interface{}{
		"message": "Lokasi dibagikan ke admin",
		"ts":      ts,
	})
}
