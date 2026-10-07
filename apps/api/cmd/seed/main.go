package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"os"

	"github.com/JejurkarYash/setu/internal/config"
	"github.com/JejurkarYash/setu/internal/database"
	"github.com/JejurkarYash/setu/internal/database/dbgen"
	"github.com/JejurkarYash/setu/internal/lib/utils"
	"github.com/JejurkarYash/setu/internal/logger"
	"github.com/jackc/pgx/v5/pgtype"
)

type Seed struct {
	pool      *database.Database
	conifg    *config.Config
	encryptor *utils.Encryptor
}

func main() {

	fmt.Println("Database Seeding Started...")
	fmt.Println("Loading Config...")
	// Load config
	config, err := config.LoadConfig()
	if err != nil {
		log.Fatal("failed to load config")
		os.Exit(1)
	}

	// logger
	seedLogger, err := logger.NewLoggger(config)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Creating Database Instance...")
	// database init
	db, err := database.New(config, seedLogger)
	if err != nil {
		log.Fatal("failed to init database(seed)", err)
		os.Exit(1)
	}

	fmt.Println("Seeding Database...")

	// 1.  create new user
	user, err := db.Queries.CreateUser(context.Background(), dbgen.CreateUserParams{
		GoogleID: "google-mock-123",
		Email:    "naruto@gmail.com",
		Name:     "Naruto Uzumaki",
		AvatarUrl: pgtype.Text{
			Valid: false,
		},
	})
	if err != nil {
		log.Fatal("failed to create USER: ", err)
		os.Exit(1)
	}
	fmt.Println("User Created Successfully:", user.ID)

	// sign jwT
	jwtToken, err := utils.GenerateJWT(user.ID)
	if err != nil {
		fmt.Println("error generating jwt", err)
	}

	fmt.Println("token:", jwtToken)

	// 2. Creating standard project with sufficient budget ($100)
	// project, err := db.Queries.CreateProject(context.Background(), dbgen.CreateProjectParams{
	// 	Name:          "OpenAI Test Project",
	// 	UserID:        user.ID,
	// 	MonthlyBudget: 100.0,
	// })
	// if err != nil {
	// 	log.Fatal("failed to create PROJECT: ", err)
	// 	os.Exit(1)
	// }
	// fmt.Println("Standard Project Created Successfully:", project.ID)

	// // 3. Creating Setu API key for standard OpenAI testing
	// rawKey := "setu_test_key_openai"
	// hash := sha256.Sum256([]byte(rawKey))
	// hashedKey := hex.EncodeToString(hash[:])

	// apiKey, err := db.Queries.CreateApiKey(context.Background(), dbgen.CreateApiKeyParams{
	// 	ProjectID: project.ID,
	// 	KeyPrefix: "setu_live_openai",
	// 	KeyHash:   hashedKey,
	// 	ExpiresAt: pgtype.Timestamptz{
	// 		Valid: false,
	// 	},
	// })
	// if err != nil {
	// 	log.Fatal("failed to create API KEY: ", err)
	// 	os.Exit(1)
	// }
	// fmt.Println("Standard API Key Created Successfully:", apiKey.KeyPrefix)

	// // 4. Encrypt and save provider keys for standard project
	encryptor, err := utils.NewEncryptor(config.Encryption.MasterKey)
	if err != nil {
		log.Fatal("failed to initialize encryptor: ", err)
		os.Exit(1)
	}

	// encryptedKey, nonce, err := encryptor.Encrypt("sk-mock-openai-key-for-testing")
	// if err != nil {
	// 	log.Fatal("failed to encrypt key: ", err)
	// 	os.Exit(1)
	// }

	// _, err = db.Queries.CreateProviderKey(context.Background(), dbgen.CreateProviderKeyParams{
	// 	ProjectID:    project.ID,
	// 	Provider:     "openai",
	// 	EncryptedKey: encryptedKey,
	// 	Nonce:        nonce,
	// })
	// if err != nil {
	// 	log.Fatal("failed to create providerKey for openai: ", err)
	// 	os.Exit(1)
	// }

	// 5. Creating a LOW BUDGET PROJECT for quota/rate limit testing ($0.0008)
	// Each mock gpt-5.5 request costs ~$0.000435, so 2 requests pass and the 3rd gets blocked!
	lowBudgetProject, err := db.Queries.CreateProject(context.Background(), dbgen.CreateProjectParams{
		Name:          "Low Budget Quota Test Project",
		UserID:        user.ID,
		MonthlyBudget: 0.0008,
	})
	if err != nil {
		log.Fatal("failed to create LOW BUDGET PROJECT: ", err)
		os.Exit(1)
	}
	fmt.Println("\nLow Budget Project Created Successfully:", lowBudgetProject.ID)

	// Low budget API Key
	lowBudgetRawKey := "setu_budget_test_key"
	lowBudgetHash := sha256.Sum256([]byte(lowBudgetRawKey))
	lowBudgetHashedKey := hex.EncodeToString(lowBudgetHash[:])

	lowBudgetApiKey, err := db.Queries.CreateApiKey(context.Background(), dbgen.CreateApiKeyParams{
		ProjectID: lowBudgetProject.ID,
		KeyPrefix: "setu_live_limit",
		KeyHash:   lowBudgetHashedKey,
		ExpiresAt: pgtype.Timestamptz{
			Valid: false,
		},
	})
	if err != nil {
		log.Fatal("failed to create low budget API KEY: ", err)
		os.Exit(1)
	}
	fmt.Println("Low Budget API Key Created Successfully:", lowBudgetApiKey.KeyPrefix)

	// Encrypted provider key for low budget project
	encryptedKeyLow, nonceLow, err := encryptor.Encrypt("sk-mock-openai-key-for-testing")
	if err != nil {
		log.Fatal("failed to encrypt key for low budget: ", err)
		os.Exit(1)
	}

	_, err = db.Queries.CreateProviderKey(context.Background(), dbgen.CreateProviderKeyParams{
		ProjectID:    lowBudgetProject.ID,
		Provider:     "openai",
		EncryptedKey: encryptedKeyLow,
		Nonce:        nonceLow,
	})
	if err != nil {
		log.Fatal("failed to create providerKey for low budget: ", err)
		os.Exit(1)
	}

	// fmt.Println("\n==========================================")
	// fmt.Println("Seeding Completed Successfully!")
	// fmt.Println("-----------------------------------------")
	// fmt.Println("1. Standard Project ($100 budget):")
	// fmt.Printf("   Key: %s\n", rawKey)
	fmt.Println("------------------------------------------")
	fmt.Println("2. Low Budget Project ($0.0008 budget):")
	fmt.Printf("   Key: %s\n", lowBudgetRawKey)
	fmt.Println("   Budget: $0.0008 (Blocks on 3rd request!)")
	fmt.Println("------------------------------------------")

	// 6. Anthropic Test Project
	anthropicProject, err := db.Queries.CreateProject(context.Background(), dbgen.CreateProjectParams{
		Name:          "Anthropic Test Project",
		UserID:        user.ID,
		MonthlyBudget: 100.0,
	})
	if err != nil {
		log.Fatal("failed to create Anthropic PROJECT: ", err)
		os.Exit(1)
	}
	fmt.Println("\nAnthropic Project Created Successfully:", anthropicProject.ID)

	// Anthropic API Key (Setu key - what the user will send in curl)
	anthropicRawKey := "setu_test_key_anthropic"
	anthropicHash := sha256.Sum256([]byte(anthropicRawKey))
	anthropicHashedKey := hex.EncodeToString(anthropicHash[:])

	anthropicApiKey, err := db.Queries.CreateApiKey(context.Background(), dbgen.CreateApiKeyParams{
		ProjectID: anthropicProject.ID,
		KeyPrefix: "setu_live_ant",
		KeyHash:   anthropicHashedKey,
		ExpiresAt: pgtype.Timestamptz{Valid: false},
	})
	if err != nil {
		log.Fatal("failed to create Anthropic API KEY: ", err)
		os.Exit(1)
	}
	fmt.Println("Anthropic API Key Created:", anthropicApiKey.KeyPrefix)

	// Encrypt and store the real Anthropic provider key
	encryptedAnthropicKey, nonceAnthropic, err := encryptor.Encrypt("mock-anthropic-provider-key")
	if err != nil {
		log.Fatal("failed to encrypt Anthropic key: ", err)
		os.Exit(1)
	}

	_, err = db.Queries.CreateProviderKey(context.Background(), dbgen.CreateProviderKeyParams{
		ProjectID:    anthropicProject.ID,
		Provider:     "anthropic",
		EncryptedKey: encryptedAnthropicKey,
		Nonce:        nonceAnthropic,
	})
	if err != nil {
		log.Fatal("failed to create Anthropic providerKey: ", err)
		os.Exit(1)
	}
	fmt.Println("Anthropic ProviderKey Created Successfully!")

	fmt.Println("------------------------------------------")
	fmt.Println("3. Anthropic Test Project ($100 budget):")
	fmt.Printf("   Key: %s\n", anthropicRawKey)
	fmt.Println("   Provider Key: mock-anthropic-provider-key")
	fmt.Println("==========================================")
}
