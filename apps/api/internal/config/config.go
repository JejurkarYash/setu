package config

import (
	"log/slog"
	"os"
	"strings"

	_ "github.com/joho/godotenv/autoload"
	"github.com/knadh/koanf/providers/env"
	"github.com/knadh/koanf/v2"
)

type Config struct {
	Primary    Primary          `kaonf:"primary"`
	Server     ServerConfig     `koanf:"server"`
	Gemini     Gemini           `koanf:"gemini"`
	Redis      RedisConfig      `koanf:"redis"`
	Database   DatabaseConfig   `koanf:"database"`
	Encryption EncryptionConfig `koanf:"encryption"`
}

type Primary struct {
	Env         string `koanf:"env"`
	LoggerLevel string `koanf:"loggerLevel"`
}
type ServerConfig struct {
	Port               int      `koanf:"port"`
	ReadTimeout        int      `koanf:"readTimeout"`
	WriteTimeout       int      `koanf:"writeTimeout"`
	IdleTimeout        int      `koanf:"idleTimeout"`
	CORSAllowedOrigins []string `koanf:"corsAllowedOrigins"`
}
type RedisConfig struct {
	Address string `koanf:"address"`
}
type Gemini struct {
	APIKey string
}

type EncryptionConfig struct {
	MasterKey string `koanf:"masterKey"`
}

type DatabaseConfig struct {
	Host            string `koanf:"host"`
	Port            int    `koanf:"port"`
	User            string `koanf:"user"`
	Password        string `koanf:"password"`
	DBName          string `koanf:"dbname"`
	SSLMode         string `koanf:"sslMode"`
	MaxOpenConns    int    `koanf:"maxOpenConns"`
	MaxIdleConns    int    `koanf:"maxIdleConns"`
	ConnMaxLifetime int    `koanf:"connMaxLifetime"`
	ConnMaxIdleTime int    `koanf:"connMaxIdleTime"`
}

func LoadConfig() (*Config, error) {
	var programLevel = new(slog.Level)
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: programLevel}))

	k := koanf.New(".")

	mainConfig := &Config{
		Database: DatabaseConfig{
			Port: 5432,
			Host: "localhost",
			// pool config
			MaxIdleConns:    25,
			ConnMaxLifetime: 5 * 60, // 5 minutes
			ConnMaxIdleTime: 5 * 60,
		},
	}

	err := k.Load(env.Provider("SETU", ".", func(s string) string {
		return strings.ToLower(strings.TrimPrefix(s, "SETU_"))
	}), nil)
	if err != nil {
		logger.Error("failed to load the config", slog.Any("err", err))
		return nil, err
	}

	err = k.Unmarshal("", mainConfig)
	if err != nil {
		logger.Error("failed to unmarshal env variables", slog.Any("err", err))
		return nil, err
	}

	// setting the CORS Domain
	mainConfig.Server.CORSAllowedOrigins = []string{"http://googgle.com", "http://testing.com"}

	return mainConfig, nil
}
