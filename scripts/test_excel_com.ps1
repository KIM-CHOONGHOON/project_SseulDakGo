try {
    $xl = New-Object -ComObject Excel.Application
    $xl.Visible = $false
    Write-Output "EXCEL_COM_OK"
    $xl.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($xl) | Out-Null
} catch {
    Write-Output "EXCEL_COM_ERR: $($_.Exception.Message)"
}

