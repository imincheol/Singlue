# 데이터 구조 및 모델 (Data Structures & Models)

이 문서는 프로젝트 애플리케이션 내에서 사용되는 핵심 데이터 모델(`interface`)을 정의합니다.
소스 파일 위치: `src/types/index.ts`

## 1. 가사 데이터 (Lyrics)
### `LyricsLine`
노래의 한 줄 가사를 구성하는 최소 단위입니다.
- **time** (`number`): 가사가 시작되는 시간 (초 단위).
- **source** (`string`): 원문 가사.
- **pron** (`string`): 발음 (Pronunciation). 한국어/일본어 등의 경우 로마자 표기, 영어의 경우 IPA 등.
- **trans** (`string`): 해석 (Translation). 사용자 언어(주로 한국어)로 번역된 텍스트.

## 2. 노래 데이터 (Song)
### `Song`
하나의 곡 정보를 담는 객체입니다.
- **id** (`string`): 고유 식별자 (UUID).
- **title** (`string`): 곡 제목.
- **artist** (`string`): 아티스트 이름.
- **lyrics** (`LyricsLine[]`): 시간순으로 정렬된 가사 라인 배열.

## 3. 비디오 매핑 (Video Mapping)
### `VideoMapping`
유튜브 비디오와 Singlue의 Song 데이터를 연결하고 싱크를 조절합니다.
- **videoId** (`string`): YouTube Video ID.
- **songId** (`string`): 매핑된 `Song` 객체의 ID.
- **globalOffset** (`number`): 전체 가사 씽크 조절을 위한 오프셋 값 (초 단위, +/-).

## 4. 히스토리 (History)
### `HistoryItem`
사용자의 시청 기록 및 '내 서재' 항목입니다.
- **videoId** (`string`): YouTube Video ID.
- **title** (`string?`): 영상 제목.
- **author** (`string?`): 채널명 또는 아티스트.
- **thumbnail** (`string`): 썸네일 URL.
- **lastPlayedAt** (`number`): 마지막 재생 시각 (Timestamp).
- **songId** (`string?`): 연결된 LRCLIB 노래 ID (선택값).
- **linkedSong** (`Song?`): 로컬에 저장/캐시된 노래 데이터 (Gemini 생성본 등).
