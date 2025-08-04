#!/bin/sh

edit() {
  insiders_or_code "${REPOSITORY_ROOT}/case-harbor.code-workspace"
}

# Windows側のプロセスを確認するためのPowerShellコマンド
check_running() {
  process_name="$1"
  # PowerShellを使用してWindows側のプロセスを確認
  powershell.exe -Command "Get-Process '$process_name' -ErrorAction SilentlyContinue" >/dev/null 2>&1
  return $?
}

insiders_or_code() {
  # VS Code Insidersが実行中かどうかを確認
  if check_running "Code - Insiders"; then
    # VS Code Insidersが実行中の場合、code-insidersコマンドを使用
    code-insiders "$@"
  else
    # それ以外の場合、デフォルトでcodeコマンドを使用
    code "$@"
  fi
}

edit "$@"
