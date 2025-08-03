// data/skills.ts
import type { HeroSkill } from '@/types/skill'

export const heroSkills: HeroSkill[] = [
    {
        id: 1,
        name: 'Thunder Arrow',
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvk4cx32JH5u6O-icQUN3FK_9yzdQDkJ_2JA&s',
        desc: 'Bắn tên sét giật cực mạnh vào kẻ địch, gây sát thương lớn.',
    },
    {
        id: 2,
        name: 'Retreat Leap',
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvk4cx32JH5u6O-icQUN3FK_9yzdQDkJ_2JA&s',
        desc: 'Bật nhảy lùi về phía sau, né tránh đòn đánh.',
    },
    {
        id: 3,
        name: 'Awaken Instinct',
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvk4cx32JH5u6O-icQUN3FK_9yzdQDkJ_2JA&s',
        desc: 'Kích hoạt bản năng sinh tồn khi nguy hiểm, tăng chỉ số tạm thời.',
    },
    // ... Thêm các skill khác
]
