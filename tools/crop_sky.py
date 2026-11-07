"""Create the study view from the registered V2.0 Taurus plate."""
from math import cos, radians, sin
from pathlib import Path

from PIL import Image

assets = Path(__file__).resolve().parents[1] / "assets"
with Image.open(assets / "sky20-taurus.webp") as plate:
    width, height = 640, 1252
    # Position Aldebaran on the optical plate. A gentle 5° roll keeps both horns
    # and the Milky Way inside the long portrait frame.
    angle = radians(-5)
    c, s = cos(angle), sin(angle)
    dx, dy = .47 * width, .68 * height
    transform = (c, -s, 385 - c * dx + s * dy,
                 s, c, 1057 - s * dx - c * dy)
    focus = plate.transform((width, height), Image.Transform.AFFINE, transform,
                            resample=Image.Resampling.BICUBIC)
    focus.save(assets / "sky22-focus.webp", quality=94, method=6)
