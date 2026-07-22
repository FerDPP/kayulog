package api

import (
	"net/http"
	"strings"

	"kayulog/backend/database"
	"kayulog/backend/handlers"
	"kayulog/backend/middleware"

	"github.com/gorilla/mux"
)

var router *mux.Router

// init is called once when the Serverless Function starts (cold start)
func init() {
	database.Init()

	r := mux.NewRouter()

	r.HandleFunc("/api/login", handlers.Login).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/register", handlers.Register).Methods("POST", "OPTIONS")

	apiRoutes := r.PathPrefix("/api").Subrouter()
	apiRoutes.Use(middleware.AuthMiddleware)

	apiRoutes.HandleFunc("/me", handlers.GetMe).Methods("GET")
	apiRoutes.HandleFunc("/dashboard", handlers.GetDashboardStats).Methods("GET")

	// Expenses
	apiRoutes.HandleFunc("/expenses", handlers.GetExpenses).Methods("GET")
	apiRoutes.HandleFunc("/expenses", handlers.CreateExpense).Methods("POST")
	apiRoutes.HandleFunc("/expenses/{id}", handlers.DeleteExpense).Methods("DELETE")

	// Categories
	apiRoutes.HandleFunc("/categories", handlers.GetCategories).Methods("GET")
	apiRoutes.HandleFunc("/categories", middleware.AdminOnly(handlers.CreateCategory)).Methods("POST")
	apiRoutes.HandleFunc("/categories/{key}", middleware.AdminOnly(handlers.DeleteCategory)).Methods("DELETE")

	// Locations
	apiRoutes.HandleFunc("/locations", handlers.GetLocations).Methods("GET")
	apiRoutes.HandleFunc("/locations", handlers.UpdateLocation).Methods("POST")

	// Capital
	apiRoutes.HandleFunc("/capital", handlers.GetCapital).Methods("GET")
	apiRoutes.HandleFunc("/capital/summary", handlers.GetCapitalSummary).Methods("GET")
	apiRoutes.HandleFunc("/capital", middleware.AdminOnly(handlers.CreateCapital)).Methods("POST")
	apiRoutes.HandleFunc("/capital/{id}", middleware.AdminOnly(handlers.DeleteCapital)).Methods("DELETE")

	// Sales
	apiRoutes.HandleFunc("/sales", handlers.GetSales).Methods("GET")
	apiRoutes.HandleFunc("/sales", middleware.AdminOnly(handlers.CreateSale)).Methods("POST")
	apiRoutes.HandleFunc("/sales/{id}", middleware.AdminOnly(handlers.DeleteSale)).Methods("DELETE")

	// Employees
	apiRoutes.HandleFunc("/employees", handlers.GetEmployees).Methods("GET")
	apiRoutes.HandleFunc("/employees/{username}", middleware.AdminOnly(handlers.DeleteEmployee)).Methods("DELETE")

	router = r
}

// Handler is the Vercel Serverless Function entrypoint
func Handler(w http.ResponseWriter, r *http.Request) {
	// Let the router handle the request
	// Apply CORS middleware
	handler := middleware.CORS(router)

	// In Vercel, the path might not exactly match our mux setup if rewritten
	// But since we mapped /api/(.*) -> /api/index, the URL Path inside the function will be correct (/api/something)
	// Some Vercel deployments strip the prefix, so we check and ensure it works
	if !strings.HasPrefix(r.URL.Path, "/api") {
		r.URL.Path = "/api" + r.URL.Path
	}

	handler.ServeHTTP(w, r)
}
