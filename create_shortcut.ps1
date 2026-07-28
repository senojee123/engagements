$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut("d:\Senojee\engagements\Start Application.lnk")
$Shortcut.TargetPath = "d:\Senojee\engagements\start.bat"
$Shortcut.WorkingDirectory = "d:\Senojee\engagements"
$Shortcut.Save()
Write-Host "Shortcut created successfully."
