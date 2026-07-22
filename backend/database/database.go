package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

// DB is the global database connection pool
var DB *sql.DB

// Init connects to PostgreSQL and sets up tables
func Init() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Default for local development (XAMPP-style, but now PostgreSQL)
		dsn = "postgres://postgres:postgres@localhost:5432/kayulog?sslmode=disable"
	}

	var err error
	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal("❌ Gagal koneksi ke PostgreSQL: ", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal("❌ Database tidak merespon: ", err)
	}

	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(5)

	createTables()
	seedDefaults()

	fmt.Println("✅ Database PostgreSQL siap digunakan")
}

func createTables() {
	tables := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			username VARCHAR(50) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			name VARCHAR(100) NOT NULL,
			role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		`CREATE TABLE IF NOT EXISTS categories (
			id SERIAL PRIMARY KEY,
			"key" VARCHAR(50) UNIQUE NOT NULL,
			label VARCHAR(100) NOT NULL,
			icon_key VARCHAR(50) DEFAULT 'lainnya'
		)`,

		`CREATE TABLE IF NOT EXISTS expenses (
			id SERIAL PRIMARY KEY,
			user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			category_key VARCHAR(50) NOT NULL,
			amount DECIMAL(15,2) NOT NULL,
			note TEXT,
			date DATE NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		`CREATE TABLE IF NOT EXISTS locations (
			user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
			lat DOUBLE PRECISION NOT NULL,
			lng DOUBLE PRECISION NOT NULL,
			accuracy DOUBLE PRECISION DEFAULT 0,
			updated_at BIGINT NOT NULL
		)`,

		`CREATE TABLE IF NOT EXISTS capital (
			id SERIAL PRIMARY KEY,
			user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			amount DECIMAL(15,2) NOT NULL,
			note TEXT,
			date DATE NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		`CREATE TABLE IF NOT EXISTS sales (
			id SERIAL PRIMARY KEY,
			company VARCHAR(200) NOT NULL,
			amount DECIMAL(15,2) NOT NULL,
			volume VARCHAR(50),
			note TEXT,
			date DATE NOT NULL,
			user_id INT REFERENCES users(id) ON DELETE SET NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
	}

	for _, t := range tables {
		if _, err := DB.Exec(t); err != nil {
			log.Fatal("❌ Gagal membuat tabel: ", err)
		}
	}
}

func seedDefaults() {
	// Seed default admin user if not exists
	var count int
	DB.QueryRow("SELECT COUNT(*) FROM users WHERE username = 'admin'").Scan(&count)
	if count == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		_, err := DB.Exec(
			"INSERT INTO users (username, password_hash, name, role) VALUES ($1, $2, $3, $4)",
			"admin", string(hash), "Admin Utama", "admin",
		)
		if err != nil {
			log.Println("⚠️  Gagal membuat admin default:", err)
		} else {
			fmt.Println("✅ Admin default dibuat (admin / admin123)")
		}
	}

	// Seed default categories if empty
	DB.QueryRow("SELECT COUNT(*) FROM categories").Scan(&count)
	if count == 0 {
		cats := []struct {
			key, label, icon string
		}{
			{"truk", "Sewa Truk", "truk"},
			{"gergaji", "Mesin Gergaji", "gergaji"},
			{"tenaga", "Bayar Tenaga Kerja", "tenaga"},
			{"lainnya", "Keperluan Lainnya", "lainnya"},
		}
		for _, c := range cats {
			DB.Exec(`INSERT INTO categories ("key", label, icon_key) VALUES ($1, $2, $3)`, c.key, c.label, c.icon)
		}
		fmt.Println("✅ Kategori default dibuat (4 kategori)")
	}
}
