#!/bin/sh

set -e

ch() {
  repository_root=$(
    cd "$(dirname "$0")"/..
    pwd
  )

  script_name=''
  subcommand=$1
  [ $# -gt 0 ] && shift
  case $subcommand in
  lint)
    script_name='lint.sh'
    ;;
  run)
    script_name='run.sh'
    ;;
  mcp-build)
    script_name='mcp-build.sh'
    ;;
  *)
    help && return
    ;;
  esac

  command="${repository_root}/cli/${script_name}"

  REPOSITORY_ROOT="$repository_root" \
    "$command" "$@"
}

help() {
  cat <<-END 1>&2

  CaseHarbor CLI コマンド
  ======================

  ch lint         コードをlintする（フロントエンド、バックエンド、MCPサーバー）
  ch run          システムを立ち上げる（フロントエンド + バックエンド）
  ch mcp-build    MCPサーバーのコードをビルドする
  ch help         このヘルプを表示する

END
}

ch "$@"