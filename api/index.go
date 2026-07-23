package api

import (
	"encoding/json"
	"net/http"

	"kayulog/backend/database"
	"kayulog/backend/handlers"
	"kayulog/backend/middleware"

	"github.com/gorilla/mux"
)

var router *mux.Router
var initError error

// init is called once when the Serverless Function starts (cold start)
func init() {
	initError = database.Init()

	if initError != nil {
		// We still need a router to exist so Handler doesn't crash on router == nil
		router = mux.NewRouter()
		return
	}

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
	// If database failed to connect, return 500 with the exact error message
	if initError != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		errorMap := map[string]string{"error": initError.Error()}
		jsonBytes, _ := json.Marshal(errorMap)
		w.Write(jsonBytes)
		return
	}

	// Read original path from query parameter (injected by Vercel rewrite)
	pathParam := r.URL.Query().Get("path")
	if pathParam != "" {
		r.URL.Path = "/api/" + pathParam
	}

	// Let the router handle the request
	// Apply CORS middleware
	handler := middleware.CORS(router)

	handler.ServeHTTP(w, r)
}
