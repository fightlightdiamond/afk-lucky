// types/skill.ts
export interface HeroSkill {
    id: number
    name: string
    img: string // hoặc StaticImageData nếu dùng import ảnh
    desc: string
    // Có thể bổ sung thêm field: cooldown, type, heroId, ...
}
