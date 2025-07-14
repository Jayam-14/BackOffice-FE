// API Endpoint Tester
// This utility helps discover what endpoints are available on your backend

const API_BASE_URL = "https://b3072eec7eb0.ngrok-free.app";

export const testApiEndpoints = async () => {
  console.log("🔍 Testing API endpoints...");

  const endpoints = [
    "/",
    "/health",
    "/auth/login",
    "/auth/register",
    "/auth/logout",
    "/auth/profile",
    "/sales/pr",
    "/sales/pr/save",
    "/sales/pr/submit",
    "/pa/pr",
    "/pa/pr/my",
    "/docs",
    "/openapi.json",
    "/api/docs",
    "/api/v1/docs",
  ];

  const results: {
    endpoint: string;
    status: number;
    contentType: string;
    exists: boolean;
  }[] = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "User-Agent": "Backoffice-FE/1.0.0",
        },
      });

      const contentType = response.headers.get("content-type") || "unknown";
      const exists = response.ok || response.status === 405; // 405 means method not allowed, but endpoint exists

      results.push({
        endpoint,
        status: response.status,
        contentType,
        exists,
      });

      console.log(
        `${exists ? "✅" : "❌"} ${endpoint} - Status: ${
          response.status
        }, Content-Type: ${contentType}`
      );
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error}`);
      results.push({
        endpoint,
        status: 0,
        contentType: "error",
        exists: false,
      });
    }
  }

  console.log("\n📋 Summary:");
  console.log("Available endpoints:");
  results
    .filter((r) => r.exists)
    .forEach((r) => {
      console.log(`  ✅ ${r.endpoint}`);
    });

  console.log("\nMissing endpoints:");
  results
    .filter((r) => !r.exists)
    .forEach((r) => {
      console.log(`  ❌ ${r.endpoint}`);
    });

  return results;
};

// Test specific endpoint with different methods
export const testEndpoint = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any
) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        "User-Agent": "Backoffice-FE/1.0.0",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log(`🔍 Testing ${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get("content-type")}`);

    if (response.ok) {
      try {
        const data = await response.json();
        console.log("Response:", data);
      } catch {
        const text = await response.text();
        console.log("Response (text):", text.substring(0, 200) + "...");
      }
    } else {
      const text = await response.text();
      console.log("Error response:", text.substring(0, 200) + "...");
    }

    return response;
  } catch (error) {
    console.error(`Error testing ${method} ${endpoint}:`, error);
    throw error;
  }
};

// Test authentication endpoints
export const testAuthEndpoints = async () => {
  console.log("\n🔐 Testing Authentication Endpoints...");

  // Test login endpoint
  await testEndpoint("/auth/login", "POST", {
    email: "test@test.com",
    password: "test123",
  });

  // Test register endpoint
  await testEndpoint("/auth/register", "POST", {
    username: "testuser",
    email: "test@test.com",
    password: "test123",
    role: "SE",
  });
};

// Test sales endpoints
export const testSalesEndpoints = async () => {
  console.log("\n💼 Testing Sales Endpoints...");

  await testEndpoint("/sales/pr", "GET");
  await testEndpoint("/sales/pr/save", "POST", {
    shipment_date: "2024-01-01",
    account_info: "Test Account",
    discount: "10%",
    origin_address: "123 Test St",
    origin_state: "CA",
    origin_zip: "12345",
    origin_country: "USA",
    dest_address: "456 Test Ave",
    dest_state: "NY",
    dest_zip: "67890",
    dest_country: "USA",
    accessorial: "Liftgate",
    pickup: "Standard",
    delivery: "Express",
    daylight_protect: true,
    items: [],
  });
};

// Test PA endpoints
export const testPAEndpoints = async () => {
  console.log("\n👨‍💼 Testing Pricing Analyst Endpoints...");

  await testEndpoint("/pa/pr", "GET");
  await testEndpoint("/pa/pr/my", "GET");
};

// Run all tests
export const runAllTests = async () => {
  console.log("🚀 Starting API Endpoint Discovery...");

  await testApiEndpoints();
  await testAuthEndpoints();
  await testSalesEndpoints();
  await testPAEndpoints();

  console.log("\n✅ API testing complete!");
};
