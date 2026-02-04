import { Pet } from "./pet"
import { Profile } from "./profile"
export type ApiGetUser = {
    data: {
        profile: Profile
        pets: Pet[]
    } | null
    error: string | null
    loading: boolean
}