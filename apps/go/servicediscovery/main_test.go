package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// Mock envGetter to simulate environment variables in tests
type mockEnvGetter struct {
	envs map[string]string
}

func (m mockEnvGetter) getEnvOrDefault(key, fallback string) string {
	if val, ok := m.envs[key]; ok {
		return val
	}
	return fallback
}

func TestRootHandler(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()

	rootHandler(w, req)

	if status := w.Code; status != http.StatusOK {
		t.Errorf("rootHandler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	expected := "Service Discovery is up and running"
	if strings.TrimSpace(w.Body.String()) != expected {
		t.Errorf("rootHandler returned unexpected body: got %v want %v", w.Body.String(), expected)
	}
}

func TestHealthHandler(t *testing.T) {
	// Create a new request to the /health endpoint
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()

	// Call the handler function
	healthHandler(w, req)

	// Check the status code is 200 OK
	if status := w.Code; status != http.StatusOK {
		t.Errorf("healthHandler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Check the response body
	expected := "Service is healthy"
	if strings.TrimSpace(w.Body.String()) != expected {
		t.Errorf("healthHandler returned unexpected body: got %v want %v", w.Body.String(), expected)
	}
}

func TestRouteRemotesHandler(t *testing.T) {
	config.RouteRemotes = []RouteRemote{
		{
			Path:  "auth",
			Name:  "authui",
			ID:    "authui/Routes",
			Entry: "http://localhost:4201",
		},
	}

	req := httptest.NewRequest(http.MethodGet, "/api/route-remotes", nil)
	w := httptest.NewRecorder()

	routeRemotesHandler(w, req)

	if status := w.Code; status != http.StatusOK {
		t.Errorf("routeRemotesHandler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	var resp []RouteRemote
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Errorf("routeRemotesHandler returned invalid JSON: %v", err)
	}

	if len(resp) != 1 || resp[0].Name != "authui" {
		t.Errorf("routeRemotesHandler returned unexpected body: got %v", resp)
	}
}

func TestNavigationItemsHandler(t *testing.T) {
	config.NavigationItems = []NavigationItem{
		{
			Path:        "users",
			Icon:        "groups",
			Title:       "Users",
			Description: "Manage users",
		},
	}

	req := httptest.NewRequest(http.MethodGet, "/api/navigation-items", nil)
	w := httptest.NewRecorder()

	navigationItemsHandler(w, req)

	if status := w.Code; status != http.StatusOK {
		t.Errorf("navigationItemsHandler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	var resp []NavigationItem
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Errorf("navigationItemsHandler returned invalid JSON: %v", err)
	}

	if len(resp) != 1 || resp[0].Title != "Users" {
		t.Errorf("navigationItemsHandler returned unexpected body: got %v", resp)
	}
}

func TestComponentRemotesHandler(t *testing.T) {
	config.ComponentRemotes = []ComponentRemote{
		{
			Name:  "usersui",
			ID:    "usersui/Header",
			Entry: "http://localhost:4202",
		},
	}

	req := httptest.NewRequest(http.MethodGet, "/api/component-remotes", nil)
	w := httptest.NewRecorder()

	componentRemotesHandler(w, req)

	if status := w.Code; status != http.StatusOK {
		t.Errorf("componentRemotesHandler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	var resp []ComponentRemote
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Errorf("componentRemotesHandler returned invalid JSON: %v", err)
	}

	if len(resp) != 1 || resp[0].Name != "usersui" {
		t.Errorf("componentRemotesHandler returned unexpected body: got %v", resp)
	}
}

func TestVersionHandler(t *testing.T) {
	// Set up a mock environment with the SD_VERSION variable
	mockEnv := mockEnvGetter{envs: map[string]string{"SD_VERSION": "1.2.3"}}

	// Create a new request to the /version endpoint
	req := httptest.NewRequest(http.MethodGet, "/version", nil)
	w := httptest.NewRecorder()

	// Call the version handler with the mock environment
	versionHandler(mockEnv)(w, req)

	// Check the status code is 200 OK
	if status := w.Code; status != http.StatusOK {
		t.Errorf("versionHandler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Verify the response contains the expected version
	expected := `{"version": "1.2.3"}`
	if strings.TrimSpace(w.Body.String()) != expected {
		t.Errorf("versionHandler returned unexpected body: got %v want %v", w.Body.String(), expected)
	}
}

func TestVersionHandlerDefault(t *testing.T) {
	// Set up a mock environment with no SD_VERSION variable
	mockEnv := mockEnvGetter{envs: map[string]string{}}

	req := httptest.NewRequest(http.MethodGet, "/version", nil)
	w := httptest.NewRecorder()

	versionHandler(mockEnv)(w, req)

	if status := w.Code; status != http.StatusOK {
		t.Errorf("versionHandler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	expected := `{"version": "local"}`
	if strings.TrimSpace(w.Body.String()) != expected {
		t.Errorf("versionHandler returned unexpected body: got %v want %v", w.Body.String(), expected)
	}
}

func TestServerRoutes(t *testing.T) {
	// Use a mock environment getter
	mockEnv := mockEnvGetter{
		envs: map[string]string{"SD_PORT": "9090"},
	}

	// Initialize the server
	server := initServer(mockEnv)

	// Ensure the server is set to the correct port
	if server.Addr != ":9090" {
		t.Errorf("server initialized with wrong port: got %v want %v", server.Addr, ":9090")
	}
}
