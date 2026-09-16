while ($true) {
    # Check if there are any changes
    $status = git status --porcelain
    if ($status) {
        $date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "Changes detected at $date. Committing and pushing..."
        git add .
        git commit -m "Auto-sync: $date"
        git push origin main
        Write-Host "Pushed successfully."
    } else {
        Write-Host "No changes detected."
    }
    # Wait for 60 seconds before checking again
    Start-Sleep -Seconds 60
}
