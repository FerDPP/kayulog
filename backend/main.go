package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"kayulog/backend/database"
	"kayulog/backend/handlers"
	"kayulog/backend/middleware"

	"github.com/gorilla/mux"
)

func main() {
	// Initialize database
	database.Init()

	// Create router
	r := mux.NewRouter()

	// --- Public routes (no auth required) ---
	r.HandleFunc("/api/login", handlers.Login).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/register", handlers.Register).Methods("POST", "OPTIONS")

	// --- Protected routes (auth required) ---
	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.AuthMiddleware)

	// User info
	api.HandleFunc("/me", handlers.GetMe).Methods("GET")

	// Dashboard stats
	api.HandleFunc("/dashboard", handlers.GetDashboardStats).Methods("GET")

	// Expenses
	api.HandleFunc("/expenses", handlers.GetExpenses).Methods("GET")
	api.HandleFunc("/expenses", handlers.CreateExpense).Methods("POST")
	api.HandleFunc("/expenses/{id}", handlers.DeleteExpense).Methods("DELETE")

	// Categories
	api.HandleFunc("/categories", handlers.GetCategories).Methods("GET")
	api.HandleFunc("/categories", middleware.AdminOnly(handlers.CreateCategory)).Methods("POST")
	api.HandleFunc("/categories/{key}", middleware.AdminOnly(handlers.DeleteCategory)).Methods("DELETE")

	// Locations
	api.HandleFunc("/locations", handlers.GetLocations).Methods("GET")
	api.HandleFunc("/locations", handlers.UpdateLocation).Methods("POST")

	// Capital
	api.HandleFunc("/capital", handlers.GetCapital).Methods("GET")
	api.HandleFunc("/capital/summary", handlers.GetCapitalSummary).Methods("GET")
	api.HandleFunc("/capital", middleware.AdminOnly(handlers.CreateCapital)).Methods("POST")
	api.HandleFunc("/capital/{id}", middleware.AdminOnly(handlers.DeleteCapital)).Methods("DELETE")

	// Sales
	api.HandleFunc("/sales", handlers.GetSales).Methods("GET")
	api.HandleFunc("/sales", middleware.AdminOnly(handlers.CreateSale)).Methods("POST")
	api.HandleFunc("/sales/{id}", middleware.AdminOnly(handlers.DeleteSale)).Methods("DELETE")

	// Employees
	api.HandleFunc("/employees", handlers.GetEmployees).Methods("GET")
	api.HandleFunc("/employees/{username}", middleware.AdminOnly(handlers.DeleteEmployee)).Methods("DELETE")

	// Apply CORS middleware globally
	handler := middleware.CORS(r)

	// Use PORT from environment (Render sets this)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Println("╔══════════════════════════════════════╗")
	fmt.Printf("║     KAYULOG Backend Server           ║\n")
	fmt.Printf("║     http://localhost:%s             ║\n", port)
	fmt.Println("╚══════════════════════════════════════╝")

	log.Fatal(http.ListenAndServe(":"+port, handler))
}
