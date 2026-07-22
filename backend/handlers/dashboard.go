package handlers

import (
	"net/http"

	"kayulog/backend/database"
)

// GetDashboardStats returns aggregated stats for the admin overview
func GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	stats := map[string]interface{}{}

	// Total expenses
	var totalExpenses float64
	database.DB.QueryRow("SELECT COALESCE(SUM(amount), 0) FROM expenses").Scan(&totalExpenses)
	stats["total_expenses"] = totalExpenses

	// This month expenses
	var monthExpenses float64
	database.DB.QueryRow(`
		SELECT COALESCE(SUM(amount), 0) FROM expenses
		WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
		  AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
	`).Scan(&monthExpenses)
	stats["month_expenses"] = monthExpenses

	// Employee count
	var empCount int
	database.DB.QueryRow("SELECT COUNT(*) FROM users WHERE role = 'user'").Scan(&empCount)
	stats["employee_count"] = empCount

	// Transaction count
	var txCount int
	database.DB.QueryRow("SELECT COUNT(*) FROM expenses").Scan(&txCount)
	stats["transaction_count"] = txCount

	// Total capital
	var totalCapital float64
	database.DB.QueryRow("SELECT COALESCE(SUM(amount), 0) FROM capital").Scan(&totalCapital)
	stats["total_capital"] = totalCapital

	// Total sales
	var totalSales float64
	database.DB.QueryRow("SELECT COALESCE(SUM(amount), 0) FROM sales").Scan(&totalSales)
	stats["total_sales"] = totalSales

	// Net income
	stats["net_income"] = totalSales - totalCapital

	// Per-category breakdown
	catRows, err := database.DB.Query(`
		SELECT c."key", c.label, c.icon_key, COALESCE(SUM(e.amount), 0) as total
		FROM categories c
		LEFT JOIN expenses e ON c."key" = e.category_key
		GROUP BY c.id, c."key", c.label, c.icon_key
		ORDER BY c.id
	`)
	if err == nil {
		defer catRows.Close()
		type CatStat struct {
			Key     string  `json:"key"`
			Label   string  `json:"label"`
			IconKey string  `json:"icon_key"`
			Total   float64 `json:"total"`
		}
		catStats := []CatStat{}
		for catRows.Next() {
			var cs CatStat
			catRows.Scan(&cs.Key, &cs.Label, &cs.IconKey, &cs.Total)
			catStats = append(catStats, cs)
		}
		stats["category_breakdown"] = catStats
	}

	jsonResponse(w, stats)
}
