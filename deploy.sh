#!/bin/bash

# Praxis Partners 创业评估工具 - 一键部署脚本
# Praxis Partners Venture Evaluation Tool - One-click Deployment Script

# Add Homebrew path at the very beginning (for Mac users)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Add common Homebrew paths
    if [ -d "/opt/homebrew/bin" ] && [[ ":$PATH:" != *":/opt/homebrew/bin:"* ]]; then
        export PATH="/opt/homebrew/bin:$PATH"
    fi
    if [ -d "/usr/local/bin" ] && [[ ":$PATH:" != *":/usr/local/bin:"* ]]; then
        export PATH="/usr/local/bin:$PATH"
    fi
fi

set -e

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Supabase Project Configuration
SUPABASE_PROJECT_ID="jyjnadjvhoeyudltvpfy"
SUPABASE_URL="https://jyjnadjvhoeyudltvpfy.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_ZdtH7mRtQN-FoNN3Hvq4vQ_XfOtcz2G"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_RaQmxxku8QUDQA1FZR6AHA_Kd31Qth9"
STRIPE_SECRET_KEY="sk_test_51SwjZeQgFR6PoIOfHjMtWUq8SPLpbmMFCWKLr2Y4TCOJWzT2r8oMlI5rTgothQcNenBEKA25h7Gf3sXjWnI77HNl001AdQg4H5"
KIMI_API_KEY=""  # Set this to your Kimi API key - get from https://platform.moonshot.cn/

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to ensure Homebrew path is available
ensure_homebrew_path() {
    # Check if running on Mac with Homebrew
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # Add common Homebrew paths if they exist
        if [ -d "/opt/homebrew/bin" ] && [[ ":$PATH:" != *":/opt/homebrew/bin:"* ]]; then
            export PATH="/opt/homebrew/bin:$PATH"
        fi
        if [ -d "/usr/local/bin" ] && [[ ":$PATH:" != *":/usr/local/bin:"* ]]; then
            export PATH="/usr/local/bin:$PATH"
        fi
    fi
}

# Function to check environment variables
check_env_vars() {
    print_info "Checking environment variables..."

    # Required variables
    local required_vars=(
        "SUPABASE_SERVICE_ROLE_KEY"
        "STRIPE_SECRET_KEY"
        "KIMI_API_KEY"
    )

    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        return 1
    fi

    print_success "All required environment variables are set"
    return 0
}

# Function to check Supabase CLI installation
check_supabase_cli() {
    print_info "Checking Supabase CLI installation..."

    if ! command_exists supabase; then
        print_error "Supabase CLI is not installed"
        print_info "Please install it first:"
        echo "  npm install -g supabase"
        echo "  # or"
        echo "  brew install supabase"
        echo ""
        print_info "Then login to your account:"
        echo "  supabase login"
        return 1
    fi

    # Check if logged in
    if ! supabase projects list >/dev/null 2>&1; then
        print_error "Not logged into Supabase CLI"
        print_info "Please login first:"
        echo "  supabase login"
        return 1
    fi

    print_success "Supabase CLI is installed and authenticated"
    return 0
}

# Function to link Supabase project
link_supabase_project() {
    print_info "Linking Supabase project..."

    if [ ! -f "./supabase/config.toml" ]; then
        print_info "Initializing Supabase project..."
        supabase init -y
    fi

    # Link to existing project
    supabase link --project-ref "$SUPABASE_PROJECT_ID"

    print_success "Supabase project linked"
}

# Function to deploy database migrations
deploy_migrations() {
    print_info "Deploying database migrations..."

    # Deploy all migrations
    supabase db push

    print_success "Database migrations deployed"
}

# Function to deploy Edge Functions
deploy_functions() {
    print_info "Deploying Edge Functions..."

    local functions=(
        "stripe-checkout-create"
        "payment-webhook"
        "claude-analysis"
    )

    for func in "${functions[@]}"; do
        print_info "Deploying $func..."

        # Deploy function with secrets
        supabase functions deploy "$func" --no-verify-jwt \
            --import-map ./supabase/functions/import_map.json \
            -e "SUPABASE_URL=$SUPABASE_URL" \
            -e "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY" \
            -e "STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY" \
            -e "KIMI_API_KEY=$KIMI_API_KEY"

        print_success "$func deployed"
    done

    print_success "All Edge Functions deployed"
}

# Function to get function URL
get_function_url() {
    local func_name=$1
    echo "https://$SUPABASE_PROJECT_ID.functions.supabase.co/$func_name"
}

# Function to test API endpoints
test_endpoints() {
    print_info "Testing API endpoints..."

    # Test Claude Analysis endpoint
    local claude_url=$(get_function_url "claude-analysis")
    print_info "Testing Claude Analysis endpoint..."

    if curl -s -X POST "$claude_url" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -d '{"prompt": "Test analysis"}' | grep -q "analysis\|error"; then
        print_success "Claude Analysis endpoint is working"
    else
        print_warning "Claude Analysis endpoint test failed (expected with no ANTHROPIC_API_KEY)"
    fi

    # Test Stripe Checkout endpoint
    local stripe_url=$(get_function_url "stripe-checkout-create")
    print_info "Testing Stripe Checkout endpoint..."

    if curl -s -X POST "$stripe_url" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -d '{"amount": 100, "description": "Test", "planId": "pro", "userId": "test-user"}' | grep -q "session_id\|error"; then
        print_success "Stripe Checkout endpoint is working"
    else
        print_warning "Stripe Checkout endpoint test failed"
    fi

    # Test Webhook endpoint (basic connectivity)
    local webhook_url=$(get_function_url "payment-webhook")
    print_info "Testing Payment Webhook endpoint..."

    if curl -s -X POST "$webhook_url" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -d '{"type": "payment.succeeded", "data": {"subscriptionId": "test"}}' | grep -q "received\|error"; then
        print_success "Payment Webhook endpoint is working"
    else
        print_warning "Payment Webhook endpoint test failed"
    fi
}

# Function to display deployment summary
display_summary() {
    print_info "=== Deployment Summary ==="
    echo ""
    echo "Supabase Project: $SUPABASE_PROJECT_ID"
    echo "Supabase URL: $SUPABASE_URL"
    echo ""
    echo "Deployed Functions:"
    echo "  - Claude Analysis: $(get_function_url "claude-analysis")"
    echo "  - Stripe Checkout: $(get_function_url "stripe-checkout-create")"
    echo "  - Payment Webhook: $(get_function_url "payment-webhook")"
    echo ""
    echo "Database Migrations:"
    for file in supabase/migrations/*.sql; do
        echo "  - $(basename "$file")"
    done
    echo ""
    echo "Environment Variables:"
    echo "  - SUPABASE_URL: Set"
    echo "  - SUPABASE_SERVICE_ROLE_KEY: Set"
    echo "  - STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:0:12}..."
    echo "  - KIMI_API_KEY: ${KIMI_API_KEY:0:12}..."
    echo "  - STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET:Not configured}"
    echo ""
    echo "Next Steps:"
    echo "  1. Configure Stripe Webhook Secret"
    echo "  2. Set up payment success/cancel URLs"
    echo "  3. Test payment flow"
    echo ""
}

# Main deployment process
main() {
    # Ensure Homebrew paths are available before any checks
    ensure_homebrew_path

    echo ""
    echo "=========================================="
    echo "Praxis Partners 创业评估工具"
    echo "Praxis Partners Venture Evaluation Tool"
    echo "=========================================="
    echo ""

    # Set environment variables for the session
    export SUPABASE_URL="$SUPABASE_URL"
    export SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
    export STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"

    # Run checks
    check_env_vars || exit 1
    check_supabase_cli || exit 1

    # Deploy
    link_supabase_project
    deploy_migrations
    deploy_functions
    test_endpoints
    display_summary

    print_success "Deployment completed successfully!"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Please read NEXT_STEPS.md for additional configuration${NC}"
    echo ""
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"
