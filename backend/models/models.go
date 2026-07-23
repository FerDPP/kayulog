package models

import "time"

// User represents a system user (admin or employee)
type User struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	Name         string    `json:"name"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
}

// Expense represents an employee's field expense record
type Expense struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	Username    string    `json:"username"`
	Name        string    `json:"name"`
	CategoryKey string    `json:"category"`
	Amount      float64   `json:"amount"`
	Note        string    `json:"note"`
	Date        string    `json:"date"`
	CreatedAt   time.Time `json:"created_at"`
}

// Category represents an expense category
type Category struct {
	ID      int    `json:"id"`
	Key     string `json:"key"`
	Label   string `json:"label"`
	IconKey string `json:"icon_key"`
}

// Location represents an employee's GPS location
type Location struct {
	UserID    int     `json:"user_id"`
	Username  string  `json:"username"`
	Name      string  `json:"name"`
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	Accuracy  float64 `json:"accuracy"`
	UpdatedAt int64   `json:"ts"`
}

// Capital represents money given by admin to employee
type Capital struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Username  string    `json:"username"`
	Name      string    `json:"name"`
	Amount    float64   `json:"amount"`
	Note      string    `json:"note"`
	Date      string    `json:"date"`
	CreatedAt time.Time `json:"created_at"`
}

// Sale represents a wood sale transaction
type Sale struct {
	ID        int       `json:"id"`
	Company   string    `json:"company"`
	Amount    float64   `json:"amount"`
	Volume    string    `json:"volume"`
	Note      string    `json:"note"`
	Date      string    `json:"date"`
	UserID    *int      `json:"user_id"`
	Username  *string   `json:"username"`
	EmpName   *string   `json:"empName"`
	CreatedAt time.Time `json:"created_at"`
}

// EmployeeSummary is used for admin overview of employee financials
type EmployeeSummary struct {
	User         User    `json:"user"`
	TotalCapital float64 `json:"total_capital"`
	TotalSpent   float64 `json:"total_spent"`
	Remaining    float64 `json:"remaining"`
}

// --- Request / Response types ---

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type UpdatePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type ExpenseRequest struct {
	CategoryKey string  `json:"category"`
	Amount      float64 `json:"amount"`
	Note        string  `json:"note"`
	Date        string  `json:"date"`
}

type CapitalRequest struct {
	Username string  `json:"username"`
	Amount   float64 `json:"amount"`
	Note     string  `json:"note"`
	Date     string  `json:"date"`
}

type SaleRequest struct {
	Company  string  `json:"company"`
	Amount   float64 `json:"amount"`
	Volume   string  `json:"volume"`
	Note     string  `json:"note"`
	Date     string  `json:"date"`
	Username string  `json:"username"`
}

type CategoryRequest struct {
	Label   string `json:"label"`
	IconKey string `json:"icon_key"`
}

type LocationRequest struct {
	Lat      float64 `json:"lat"`
	Lng      float64 `json:"lng"`
	Accuracy float64 `json:"accuracy"`
}
