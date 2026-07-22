package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"kayulog-backend/database"
	"kayulog-backend/middleware"
	"kayulog-backend/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Login authenticates a user and returns a JWT token
func Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Data tidak valid", http.StatusBadRequest)
		return
	}

	if req.Username == "" || req.Password == "" {
		jsonError(w, "Isi username dan kata sandi", http.StatusBadRequest)
		return
	}

	var user models.User
	err := database.DB.QueryRow(
		"SELECT id, username, password_hash, name, role FROM users WHERE username = $1",
		req.Username,
	).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.Name, &user.Role)

	if err != nil {
		jsonError(w, "Username atau kata sandi salah", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		jsonError(w, "Username atau kata sandi salah", http.StatusUnauthorized)
		return
	}

	tokenStr, err := generateToken(user)
	if err != nil {
		jsonError(w, "Gagal membuat token", http.StatusInternalServerError)
		return
	}

	jsonResponse(w, models.LoginResponse{Token: tokenStr, User: user})
}

// Register creates a new employee account
func Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Data tidak valid", http.StatusBadRequest)
		return
	}

	if req.Name == "" || req.Username == "" || req.Password == "" {
		jsonError(w, "Semua kolom wajib diisi", http.StatusBadRequest)
		return
	}

	if len(req.Password) < 4 {
		jsonError(w, "Kata sandi minimal 4 karakter", http.StatusBadRequest)
		return
	}

	var count int
	database.DB.QueryRow("SELECT COUNT(*) FROM users WHERE username = $1", req.Username).Scan(&count)
	if count > 0 {
		jsonError(w, "Username sudah dipakai, pilih yang lain", http.StatusConflict)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		jsonError(w, "Gagal memproses kata sandi", http.StatusInternalServerError)
		return
	}

	var id int
	err = database.DB.QueryRow(
		"INSERT INTO users (username, password_hash, name, role) VALUES ($1, $2, $3, 'user') RETURNING id",
		req.Username, string(hash), req.Name,
	).Scan(&id)
	if err != nil {
		jsonError(w, "Gagal mendaftarkan akun", http.StatusInternalServerError)
		return
	}

	user := models.User{
		ID:       id,
		Username: req.Username,
		Name:     req.Name,
		Role:     "user",
	}

	tokenStr, _ := generateToken(user)
	jsonResponse(w, models.LoginResponse{Token: tokenStr, User: user})
}

// GetMe returns the currently authenticated user's info
func GetMe(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaims(r)

	var user models.User
	err := database.DB.QueryRow(
		"SELECT id, username, name, role FROM users WHERE id = $1",
		claims.UserID,
	).Scan(&user.ID, &user.Username, &user.Name, &user.Role)

	if err != nil {
		jsonError(w, "User tidak ditemukan", http.StatusNotFound)
		return
	}

	jsonResponse(w, user)
}

func generateToken(user models.User) (string, error) {
	claims := &middleware.Claims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(72 * time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(middleware.JWTSecret)
}

// --- JSON helper functions (shared across all handlers) ---

func jsonResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func jsonError(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
