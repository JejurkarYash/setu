package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type ErrorResponse struct {
	Error string
}

// generic function to write response
func WriteJSON(w http.ResponseWriter, status int, v interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	return json.NewEncoder(w).Encode(v)
}

// reading JSON
func ReadJSON(r *http.Request, v interface{}) error {
	if r.Body == nil {
		return fmt.Errorf("Missing Request Body")
	}
	decoder := json.NewDecoder(r.Body)
	return decoder.Decode(v)
}

// generic function to write Errors
func WriteError(w http.ResponseWriter, status int, message string) error {
	return WriteJSON(w, status, ErrorResponse{Error: message})
}
