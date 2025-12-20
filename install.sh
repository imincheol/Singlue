#!/bin/bash
# ODD Starter v5.6 Installer

REPO_URL="https://raw.githubusercontent.com/imincheol/odd-starter/main"

echo "🚀 ODD 시스템 동기화를 시작합니다..."

# 1. [System] 필수 시스템 파일 존재 확인 및 원격 다운로드
fetch_system_file() {
    FILE_PATH=$1
    if [ ! -f "$FILE_PATH" ] || [[ "$*" == *"--update"* ]]; then
        echo "📥 [시스템] $FILE_PATH 동기화 중..."
        mkdir -p "$(dirname "$FILE_PATH")"
        # 임시 파일로 다운로드 후 성공시에만 교체
        if curl -sL "$REPO_URL/$FILE_PATH" -o "${FILE_PATH}.tmp"; then
            mv "${FILE_PATH}.tmp" "$FILE_PATH"
        else
            echo "⚠️  [경고] $FILE_PATH 다운로드 실패. 기존 파일을 유지하거나 건너뜁니다."
            rm -f "${FILE_PATH}.tmp"
        fi
    fi
}

# 주요 시스템 파일 강제 대조 (항상 최신 버전 유지)
fetch_system_file "AGENTS.md" --update
fetch_system_file "install.sh" --update
fetch_system_file ".odd/_templates/ATLAS.md" --update
fetch_system_file ".odd/_templates/history.md" --update
fetch_system_file ".odd/_templates/roadmap.md" --update
fetch_system_file ".odd/_templates/order.json" --update
fetch_system_file ".odd/_templates/progress.json" --update
fetch_system_file ".odd/_templates/report.json" --update
fetch_system_file ".odd/_templates/specs_readme.md" --update

# 2. [Scaffolding] 사용자 데이터 폴더 구조 생성
mkdir -p docs/library/domains
mkdir -p docs/library/tech
mkdir -p docs/odd/tasks
mkdir -p docs/odd/archive
mkdir -p docs/specs/{0_origin,1_planning,2_design,3_markup,4_development}

# 3. [User Data] 초기화 (파일이 없는 경우에만 템플릿에서 복사)
safe_copy() {
    TEMPLATE=$1
    TARGET=$2
    if [ ! -f "$TARGET" ]; then
        echo "✨ [생성] $TARGET"
        cp "$TEMPLATE" "$TARGET"
    else
        echo "🛡️ [보존] $TARGET (데이터 보호됨)"
    fi
}

echo "📂 사용자 데이터 초기화 중..."
safe_copy ".odd/_templates/ATLAS.md" "docs/library/ATLAS.md"
safe_copy ".odd/_templates/roadmap.md" "docs/odd/roadmap.md"
safe_copy ".odd/_templates/history.md" "docs/odd/history.md"

# 스펙 파일 README.md 표준화
for dir in docs/specs/*; do
    if [ -d "$dir" ]; then
        safe_copy ".odd/_templates/specs_readme.md" "$dir/README.md"
    fi
done

echo "✅ ODD v5.6 시스템이 준비되었습니다."