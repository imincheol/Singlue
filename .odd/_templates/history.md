# Project History & Decision Log

이곳은 프로젝트의 **기술적 의사결정(Decision)**과 **교훈(Lesson)**을 기록하는 곳입니다.
작업(Task) 완료 후, **"미래의 나에게 남길 핵심 한 줄"**을 적으십시오.

## 🔖 Active Log (Latest First)
> **Format**: `[Date] #Tag : Content (Why & Caution)`

- **[2025-12-20] #Sync #UX**: 싱크 조절을 슬라이더에서 **버튼형**으로 변경. (이유: 슬라이더는 1ms 단위 정밀 조작이 불가능함)
- **[2025-12-19] #Mobile #CSS**: 모바일 뷰에서 `w-screen` 사용 금지. (주의: 가로 스크롤 발생함. `w-full` 권장)