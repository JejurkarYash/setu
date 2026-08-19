package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
)

type Encryptor struct {
	aead cipher.AEAD
}

func NewEncryptor(masterKey string) (*Encryptor, error) {

	// converting 64 hex character string into 32 rawbyytes
	keyBytes, err := hex.DecodeString(masterKey)
	if err != nil {
		return nil, fmt.Errorf("failed to convert hex character into bytes: %w", err)
	}

	if len(keyBytes) != 32 {
		return nil, errors.New("master encryption key must be 32 bytes (64 hex characters)")
	}

	block, err := aes.NewCipher(keyBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to create cihper block: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM cihper: %w", err)
	}

	return &Encryptor{aead: gcm}, nil

}

// Encryption
func (e *Encryptor) Encrypt(plainText string) (ciphertext []byte, nonce []byte, err error) {
	// creating 12 byyte empty slice to store nonce
	nonce = make([]byte, e.aead.NonceSize())

	// filling nonce with cryptographically secure random byytes
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, nil, fmt.Errorf("failed to generate random nonce bytes: %w", err)
	}

	// encrypting plaintext
	ciphertext = e.aead.Seal(nil, nonce, []byte(plainText), nil)

	return ciphertext, nonce, nil
}

func (e *Encryptor) Decrypt(ciphertext, nonce []byte) (string, error) {
	// Decrypt and verify authentication tag in one step
	plainBytes, err := e.aead.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", fmt.Errorf("decryption failed or data tampered: %w", err)
	}

	//  Cast bytes back into human-readable string
	return string(plainBytes), nil
}
