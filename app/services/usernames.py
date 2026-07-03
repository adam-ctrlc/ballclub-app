import re
import secrets

from app.models.owner import Owner


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]", "", text.lower())


async def generate_username(first_name: str, last_name: str) -> str:
    """Build a unique username from a name, e.g. "John Adam" / "Cuenca" -> "john_cuenca_4821".

    Uses the first word of the first name plus the last name, joined with an
    underscore, and appends random digits. Retries with new digits until the
    result does not collide with an existing owner.
    """
    first = _slug(first_name.split()[0]) if first_name.strip() else ""
    last = _slug(last_name)
    parts = [p for p in (first, last) if p]
    base = "_".join(parts) if parts else "user"
    base = base[:22]  # leave room for the "_NNNN" suffix within 30 chars

    for _ in range(25):
        digits = secrets.randbelow(9000) + 1000  # 1000-9999
        candidate = f"{base}_{digits}"
        if not await Owner.find_one({"username": candidate}):
            return candidate

    return f"{base}_{secrets.randbelow(1_000_000)}"
