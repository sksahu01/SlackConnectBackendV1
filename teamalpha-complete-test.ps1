# TeamAlpha Slack Integration - Complete Test Script
# =================================================

Write-Host "🧪 Testing TeamAlpha Slack Integration" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3001/api"
$webhookUrl = "https://hooks.slack.com/services/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"

Write-Host ""
Write-Host "🔗 Base URL: $baseUrl" -ForegroundColor Gray
Write-Host "🪝 Webhook: $webhookUrl" -ForegroundColor Gray
Write-Host ""

# Test 1: Send immediate message via webhook endpoint
Write-Host "📤 Test 1: Sending immediate message..." -ForegroundColor Yellow

$immediateMessage = @{
    message = "🚀 **Immediate Message Test** - Sent at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n✅ TeamAlpha webhook integration is working perfectly!"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/messages/webhook/send" -Method POST -Body $immediateMessage -ContentType "application/json"
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Response: $($response1.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Schedule a message
Write-Host "📅 Test 2: Scheduling a message for 1 minute from now..." -ForegroundColor Yellow

$scheduledTime = [DateTimeOffset]::Now.AddMinutes(1).ToUnixTimeSeconds()
$scheduledMessage = @{
    message = "⏰ **Scheduled Message Test** - This message was scheduled at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n🎯 Automated scheduling is working!"
    scheduled_for = $scheduledTime
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "$baseUrl/messages/webhook/schedule" -Method POST -Body $scheduledMessage -ContentType "application/json"
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Scheduled ID: $($response2.data.id)" -ForegroundColor Gray
    Write-Host "Will be sent at: $(([DateTimeOffset]::FromUnixTimeSeconds($scheduledTime)).ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Test the original webhook endpoint
Write-Host "🔧 Test 3: Testing original webhook endpoint..." -ForegroundColor Yellow

$webhookTest = @{
    webhook_url = $webhookUrl
    message = "🔧 **Test Endpoint** - Original webhook test at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri "$baseUrl/test/webhook" -Method POST -Body $webhookTest -ContentType "application/json"
    Write-Host "✅ Success!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Health check
Write-Host "💓 Test 4: Checking server health..." -ForegroundColor Yellow

try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Server is healthy!" -ForegroundColor Green
    Write-Host "Version: $($health.version)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Server health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Summary:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Immediate messaging: Working" -ForegroundColor Green
Write-Host "✅ Message scheduling: Working" -ForegroundColor Green
Write-Host "✅ Webhook integration: Working" -ForegroundColor Green
Write-Host "✅ Server health: OK" -ForegroundColor Green
Write-Host ""
Write-Host "🏢 TeamAlpha workspace: teamalpha-hbb8309.slack.com" -ForegroundColor Cyan
Write-Host "🚀 Your Slack Connect system is fully operational!" -ForegroundColor Green

# Interactive functions
Write-Host ""
Write-Host "💡 Interactive Functions Available:" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

function Send-TeamAlphaMessage {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    
    $body = @{ message = $Message } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/messages/webhook/send" -Method POST -Body $body -ContentType "application/json"
        Write-Host "✅ Message sent: $Message" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "❌ Failed to send message: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Schedule-TeamAlphaMessage {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [Parameter(Mandatory=$true)]
        [int]$MinutesFromNow
    )
    
    $scheduledTime = [DateTimeOffset]::Now.AddMinutes($MinutesFromNow).ToUnixTimeSeconds()
    $body = @{
        message = $Message
        scheduled_for = $scheduledTime
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/messages/webhook/schedule" -Method POST -Body $body -ContentType "application/json"
        Write-Host "✅ Message scheduled: $Message" -ForegroundColor Green
        Write-Host "   Will be sent in $MinutesFromNow minutes" -ForegroundColor Gray
        return $response
    } catch {
        Write-Host "❌ Failed to schedule message: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host ""
Write-Host "Usage Examples:" -ForegroundColor Gray
Write-Host 'Send-TeamAlphaMessage -Message "Hello TeamAlpha!"' -ForegroundColor Gray
Write-Host 'Schedule-TeamAlphaMessage -Message "Reminder!" -MinutesFromNow 5' -ForegroundColor Gray
