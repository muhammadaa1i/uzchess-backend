export function calculateAge(birthDate: Date | string | null): number | null {
    if (!birthDate) return null;
    const dob = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const hasHadBirthdayThisYear =
        now.getMonth() > dob.getMonth() ||
        (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate());
    if (!hasHadBirthdayThisYear) age--;
    return age;
}
