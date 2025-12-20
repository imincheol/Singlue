# 🔄 Sync Logic (싱크 로직)

이 문서는 **싱크 오프셋(Offset)**의 계산 방식과 데이터 흐름을 정의합니다.
싱크 불일치는 노래방 앱에서 가장 치명적인 경험이므로, 수정 시 신중해야 합니다.

## 📐 Core Formula (공식)

최종적으로 화면에 적용되는 싱크(`totalOffset`)는 다음 세 가지 값의 합입니다.

$$
\text{TotalOffset} = \text{Global} + \text{Draft} + \text{User}
$$

### 1. Global Offset (`global`)
- **성격**: 시스템 전체 설정 (불변에 가까움)
- **용도**: 기기별/브라우저별 지연 보정 (현재는 0으로 고정)

### 2. Draft Offset (`draft`)
- **성격**: **영구적 (Persistent)**, DB 저장 대상
- **용도**: **"이 가사는 원래 0.5초 늦게 나온다"**는 사실을 수정.
- **주체**: 에디터(Editor) 모드에서 수정.

### 3. User Offset (`user`)
- **성격**: **휘발성 (Volatile)**, 세션 내 유효
- **용도**: **"지금 내 박자가 조금 빠르네?"** (일시적 조절).
- **주체**: 플레이어(Player) 모드에서 조절.

---

## 🏛️ Decision History (의사결정)

### [2025-12-20] 재생/편집 로직 분리 및 UI 변경
- **Context**: 
  - 과거에는 하나의 슬라이더로 싱크를 조절했음.
  - 사용자가 "이게 저장이 되는 건가? 아니면 그냥 나만 바뀌는 건가?"를 헷갈려 함.
  - 실수로 원본 데이터를 망가뜨리는 경우 발생.
- **Decision**:
  - **Logic Separation**: `userOffset`(재생용)과 `draftOffset`(편집용)을 `useAppStore`에서 분리.
  - **UI Changes**: 
    - 미세 조절이 어려운 **슬라이더(Slider)**를 폐기.
    - 명확한 피드백을 주는 **버튼(-0.5, -0.1, +0.1, +0.5)** 방식으로 변경.
  - **Result**: "저장되지 않음(휘발성)"과 "저장됨(영구적)"의 UX가 명확해짐.

## ⚠️ Cautions (주의사항)

1. **Total Offset 계산 위치**:
   - `KaraokeOverlay` 등 렌더링 단에서 계산하지 말고, 가급적 **Store Selector**나 **Hook**을 통해 계산된 값을 받으십시오.
   - 현재는 `useAppStore` 내부 혹은 컴포넌트 진입부에서 합산하여 사용 중입니다.

2. **초기화 시점**:
   - 노래가 변경되면 `userOffset`은 0으로 초기화되어야 합니다.
   - `draftOffset`은 해당 노래의 DB 값에서 불러와야 합니다.
