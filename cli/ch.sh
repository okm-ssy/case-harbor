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
  edit)
    script_name='edit.sh'
    ;;
  lint)
    script_name='lint.sh'
    ;;
  run)
    script_name='run.sh'
    ;;
  test)
    script_name='test.sh'
    ;;
  mcp-build)
    script_name='mcp-build.sh'
    ;;
  migrate)
    script_name='migrate.sh'
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

  ch edit         サーバーを停止してコード編集に切り替える
  ch lint         コードをlintする（フロントエンド、バックエンド、MCPサーバー）
  ch run          システムを立ち上げる（フロントエンド + バックエンド）
  ch test         自動テストを実行する（バックエンド）
  ch mcp-build    MCPサーバーのコードをビルドする
  ch migrate      データを新しいファイル構造に移行する
  ch help         このヘルプを表示する

END
}

ch "$@"
