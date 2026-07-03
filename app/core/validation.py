import re


def validate_name(name: str | None) -> bool:
    if not name or not isinstance(name, str):
        return False
    length = len(name.strip())
    return 2 <= length <= 100


def validate_phone(phone: str | None) -> bool:
    if not phone or not isinstance(phone, str):
        return False
    digits = re.sub(r"\D", "", phone)
    return 10 <= len(digits) <= 15


USERNAME_RE = re.compile(r"^[a-zA-Z0-9._-]{3,30}$")


def validate_username(username: str | None) -> bool:
    if not username or not isinstance(username, str):
        return False
    return bool(USERNAME_RE.match(username.strip()))
