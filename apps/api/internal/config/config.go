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
	Primary Primary      `kaonf:"primary"`
	Server  ServerConfig `koanf:"server"`
	Gemini  Gemini       `koanf:"gemini"`
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

type Gemini struct {
	APIKey string
}

func LoadConfig() (*Config, error) {
	var programLevel = new(slog.Level)
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: programLevel}))

	k := koanf.New(".")

	err := k.Load(env.Provider("SETU", ".", func(s string) string {
		return strings.ToLower(strings.TrimPrefix(s, "SETU_"))
	}), nil)
	if err != nil {
		logger.Error("failed to load the config", err)
		return nil, err
	}

	mainConfig := &Config{}

	err = k.Unmarshal("", mainConfig)
	if err != nil {
		logger.Error("failed to unmarshal env variables", err)
		return nil, err
	}

	// setting the CORS Domain
	mainConfig.Server.CORSAllowedOrigins = []string{"http://googgle.com", "http://testing.com"}

	return mainConfig, nil
}
