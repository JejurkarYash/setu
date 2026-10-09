package utils

import (
	"crypto/rand"
	"encoding/hex"
)

// generate setu api keys
func GenerateAPIKey() (string, error) {
	b := make([]byte, 32)

	if _, err := rand.Read(b); err != nil {
		return "", err
	}

	return "setu_" + hex.EncodeToString(b), nil
}
