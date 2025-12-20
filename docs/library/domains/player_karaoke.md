# 🎤 Player & Karaoke (플레이어 & 카라오케)

유튜브 영상 위에 가사를 띄우는 이 프로젝트의 핵심 기능(Core Feature)입니다.

## 🧩 Components Architecture

### 1. `KaraokeOverlay`
- **역할**: 실제 가사가 렌더링되는 투명 레이어.
- **위치**: `z-overlay` (유튜브 iframe보다 위에 있어야 함).
- **특징**:
  - `Fullscreen API`를 사용해 몰입 모드 제공.
  - 마우스가 멈추면 UI(`PlaybackControlBar`)가 사라지는 인터랙션 포함.

### 2. `ThreeLineLyrics`
- **역할**: 현재 가사(Current), 다음 가사(Next), 이전 가사(Prev)를 3줄로 표현.
- **스타일링**:
  - 가독성을 위해 `Current` 라인은 가장 크고 밝게(Opacity 100%).
  - `Next` 라인은 미리보기를 위해 약간 투명하게(Opacity 90%).

---

## 🏛️ Decision History

### [2025-12-19] 가독성 개선 및 UI 직관화
- **Issue**:
  - 마이크 아이콘만으로는 "이게 노래방 모드인가?"를 알기 어려웠음.
  - 다음 가사가 안 보여서 박자를 놓침.
- **Fix**:
  - **Button**: 🎙️ 아이콘 → **'KARAOKE' 텍스트 버튼**으로 교체하여 인지 비용 감소.
  - **Next Line**: 다음 가사 미리보기 기능 추가.
  - **Font**: 모바일 실사용 테스트 후 폰트 사이즈 상향 조정.

### [2025-12-20] Mobile Safari Fullscreen
- **Problem**: iOS Safari에서는 사용자 제스처(Click)가 없는 비동기 로직 내에서 Fullscreen 요청이 차단됨.
- **Workaround**: Fullscreen 토글은 반드시 버튼의 `onClick` 핸들러 내에서 직접 호출되도록 설계해야 함.

## ⚠️ Cautions

1. **YouTube Iframe Click Jacking**:
   - 유튜브 정책상 투명 레이어가 영상을 완전히 가리면 조작(일시정지 등)이 안 될 수 있음.
   - 이를 해결하기 위해 **별도의 Control Bar**를 구현하여 영상 제어권을 앱이 가져옴.

2. **Z-Index War**:
   - 오버레이가 `Header(GNB)`보다 위에 와야 할 때가 있고, 모달보다는 아래에 있어야 함.
   - `docs/library/domains/web_layer_system.md`의 규칙을 준수할 것.
