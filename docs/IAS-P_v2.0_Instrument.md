# IAS-P v2.0 — Instrument Specification

**Independent Ageing Score — Proxy Version 2.0**

Canonical reference for question count, prompts, answer options, scoring, and red flags.  
Source of truth for API parameter keys: `server/src/modules/scoring/ias-calculator.ts`.  
Frontend wizard copy: `client/features/assessments/data/iasp-questionnaire-data.ts`.

---

## Summary

| Property | Value |
| -------- | ----- |
| Scored items | **24** (one question per item; wizard shows “Question *n* of **24**”) |
| Sections | **8** (A–H) |
| Answer options per item | **3** (same labels and descriptions for every question) |
| Points per item | 0, 1, or 2 |
| Max raw score | **48** (24 × 2) |
| Percentage formula | `IAS% = (raw_score / 48) × 100` |
| Risk bands | 5 |
| Red flags (separate checklist) | 8 |

---

## Response scale (all 24 items)

Every scored item uses the same three options. Helper text shown in the wizard:

> Select the option that best describes the patient's current daily ability.

| UI label | API value | Points | Description |
| -------- | --------- | ------ | ----------- |
| **Independent** | `2` | 2 | Completes the activity without assistance or supervision. |
| **Needs Assistance** | `1` | 1 | Requires some assistance, supervision, or reminders. |
| **Dependent** | `0` | 0 | Requires complete assistance to perform the activity. |

Keyboard shortcuts in the wizard: **1** = Independent, **2** = Needs Assistance, **3** = Dependent.

---

## Section breakdown

| Section | Domain key | Items | Max section score |
| ------- | ---------- | ----- | ----------------- |
| A — Basic Self-Care | `basic_self_care` | 4 | 8 |
| B — Daily Life Function | `daily_life_function` | 4 | 8 |
| C — Mobility | `mobility` | 4 | 8 |
| D — Thinking & Decision-Making | `thinking_decision` | 3 | 6 |
| E — Health Management | `health_management` | 3 | 6 |
| F — Nutrition & Continence | `nutrition_continence` | 3 | 6 |
| G — Social Function | `social_function` | 2 | 4 |
| H — Safety & Support | `safety_support` | 1 | 2 |
| **Total** | | **24** | **48** |

---

## Complete question inventory (24 items)

| # | Section | API parameter | Question prompt |
| - | ------- | ------------- | --------------- |
| 1 | A | `bathing` | Can the patient bathe independently? |
| 2 | A | `dressing` | Can the patient dress independently? |
| 3 | A | `toileting` | Can the patient use the toilet independently? |
| 4 | A | `feeding` | Can the patient eat and drink independently? |
| 5 | B | `phone_communication` | Can the patient use a phone independently? |
| 6 | B | `daily_home_tasks` | Can the patient manage basic home tasks independently? |
| 7 | B | `simple_purchases` | Can the patient make simple purchases independently? |
| 8 | B | `organizing_essentials` | Can the patient manage bills and paperwork independently? |
| 9 | C | `moving_inside_house` | Can the patient move around the home independently? |
| 10 | C | `getting_up` | Can the patient get up from a bed or chair independently? |
| 11 | C | `walking_outside` | Can the patient move outdoors independently? |
| 12 | C | `falls_6_months` | In the last 6 months, has the patient stayed free from repeated falls? |
| 13 | D | `remembering_routine` | Can the patient remember daily routines independently? |
| 14 | D | `understanding_instructions` | Can the patient follow instructions independently? |
| 15 | D | `safe_decisions` | Can the patient make safe decisions independently? |
| 16 | E | `taking_medicines` | Can the patient manage medications independently? |
| 17 | E | `understanding_health` | Can the patient understand their health independently? |
| 18 | E | `following_appointments` | Can the patient manage medical appointments independently? |
| 19 | F | `eating_drinking` | Can the patient maintain adequate nutrition and hydration independently? |
| 20 | F | `weight_appetite` | Can the patient maintain a stable weight and appetite independently? |
| 21 | F | `bladder_bowel` | Can the patient manage bladder and bowel control independently? |
| 22 | G | `communicating_needs` | Can the patient communicate their needs independently? |
| 23 | G | `social_contact` | Can the patient maintain social contact independently? |
| 24 | H | `emergency_help` | Can the patient summon help in an emergency independently? |

### Section C — `falls_6_months` scoring guidance

This item uses the same 0–2 scale as all other items (not a yes/no field):

| Score | Meaning |
| ----- | ------- |
| 2 (Independent) | No falls in the last 6 months |
| 1 (Needs Assistance) | One fall, or near-misses requiring supervision |
| 0 (Dependent) | Two or more falls in the last 6 months |

Selecting **two or more falls** on this item often correlates with the `two_or_more_falls` red flag (see below); both are captured separately.

### Frontend ↔ API parameter map

| Frontend question `id` | API parameter |
| ------------------------ | ------------- |
| `bathe` | `bathing` |
| `dress` | `dressing` |
| `toilet` | `toileting` |
| `eat-drink` | `feeding` |
| `phone` | `phone_communication` |
| `home-tasks` | `daily_home_tasks` |
| `purchases` | `simple_purchases` |
| `bills` | `organizing_essentials` |
| `move-home` | `moving_inside_house` |
| `transfer` | `getting_up` |
| `outdoors` | `walking_outside` |
| `falls` | `falls_6_months` |
| `routines` | `remembering_routine` |
| `instructions` | `understanding_instructions` |
| `decisions` | `safe_decisions` |
| `medications` | `taking_medicines` |
| `understand-health` | `understanding_health` |
| `appointments` | `following_appointments` |
| `nutrition-hydration` | `eating_drinking` |
| `weight-appetite` | `weight_appetite` |
| `continence` | `bladder_bowel` |
| `communicate` | `communicating_needs` |
| `social-contact` | `social_contact` |
| `summon-help` | `emergency_help` |

---

## Red flags (8 items — not scored)

Collected after the 24 scored questions. Helper text:

> Select any urgent concerns that may require immediate professional attention.

| # | API key | Label |
| - | ------- | ----- |
| 1 | `two_or_more_falls` | Two or more falls in the last 6 months |
| 2 | `missed_incorrect_medicines` | Missed or taken medications incorrectly |
| 3 | `unsafe_decisions` | Recently made unsafe decisions |
| 4 | `significant_weight_loss` | Significant or unexplained weight loss |
| 5 | `social_isolation` | Showing signs of social isolation |
| 6 | `recurrent_hospital_admissions` | Recurrent hospital admissions |
| 7 | `caregiver_struggling` | Primary caregiver is struggling or absent |
| 8 | `no_emergency_response` | Cannot summon help in an emergency |

### Urgency tiers (from red-flag count)

| Flag count | Urgency | Action |
| ---------- | ------- | ------ |
| 0 | `routine_monitoring` | No alert |
| 1–2 | `review_needed` | Coordinator review |
| 3+ | `urgent_care_planning` | Immediate care team escalation |

---

## Risk bands

| IAS% | Risk band | Recommended pathway |
| ---- | --------- | ------------------- |
| 85–100 | Strong Independent | Home care |
| 70–84 | Independent but Vulnerable | Home care |
| 55–69 | Supported Independence | Hybrid care |
| 40–54 | Limited Independence | Clinic care |
| 0–39 | High Dependence | High dependency |

---

## Wizard flow (UI)

1. **About you** — proxy metadata (relationship, proximity, visit frequency, age, living situation)
2. **Questionnaire** — 24 pages, one question each (`Question 1 of 24` … `Question 24 of 24`)
3. **Red flags** — optional multi-select checklist (8 items)
4. **Review** — answers grouped by section A–H
5. **Results** — IAS%, risk band, pathway, domain breakdown

Progress percentage in the questionnaire is based on **answered scored items / 24**.

---

## Related files

| Layer | Path |
| ----- | ---- |
| API calculator | `server/src/modules/scoring/ias-calculator.ts` |
| API validation | `server/src/modules/scoring/scoring.schema.ts` |
| Frontend questions | `client/features/assessments/data/iasp-questionnaire-data.ts` |
| Frontend scoring | `client/features/assessments/data/iasp-scoring.ts` |
| Frontend red flags | `client/features/assessments/data/iasp-red-flags-data.ts` |
| HLD deep dive | `docs/nivarak_hld_lld.html` §8 |
