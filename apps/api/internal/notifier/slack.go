package notifier

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type SlackNotifier struct {
	client *http.Client
}

type PayloadType struct {
	ProjectName string  `json:"project_name"`
	Message     string  `json:"message"`
	Spend       float64 `json:"spend"`
	Budget      float64 `json:"budget"`
	Threshold   int32   `json:"threshold"`
}

func NewSlackNotifier() *SlackNotifier {
	return &SlackNotifier{
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}

}

func (s *SlackNotifier) Send(
	ctx context.Context,
	webhookURL string,
	projectName string,
	spend float64,
	budget float64,
	threshold int32,
) error {
	payload := map[string]string{
		"text": fmt.Sprintf(
			"🚨 *Setu Budget Alert*\n"+
				"Project: %s\n"+
				"Budget used: %d%%\n"+
				"Current spend: $%.2f / $%.2f",
			projectName,
			threshold,
			spend,
			budget,
		),
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal Slack payload: %w", err)
	}

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		webhookURL,
		bytes.NewReader(body),
	)
	if err != nil {
		return fmt.Errorf("create Slack request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("send Slack notification: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("Slack returned status %d", resp.StatusCode)
	}

	return nil
}
