# Test script for sending messages to TeamAlpha Slack workspace
# Webhook URL: https://hooks.slack.com/services/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

Write-Host "🧪 Testing Slack Webhook for TeamAlpha workspace" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$webhookUrl = "https://hooks.slack.com/services/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"
$apiUrl = "http://localhost:3001/api/test/webhook"

Write-Host ""
Write-Host "📤 Sending test message..." -ForegroundColor Yellow

$body = @{
    webhook_url = $webhookUrl
    message = "🚀 Hello from Slack Connect Backend! Testing message at $(Get-Date)"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $body -ContentType "application/json"
    Write-Host ""
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host ""
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "🔗 Webhook URL: $webhookUrl" -ForegroundColor Cyan
Write-Host "🏢 Workspace: teamalpha-hbb8309.slack.com" -ForegroundColor Cyan

# Function to send custom messages
function Send-SlackMessage {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    
    $body = @{
        webhook_url = $webhookUrl
        message = $Message
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $body -ContentType "application/json"
        Write-Host "✅ Message sent: $Message" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "❌ Failed to send message: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host ""
Write-Host "💡 To send a custom message, use:" -ForegroundColor Magenta
Write-Host "Send-SlackMessage -Message 'Your custom message here'" -ForegroundColor Gray
