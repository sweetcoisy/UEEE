from __future__ import annotations

from pathlib import Path

import geopandas as gpd
import matplotlib.pyplot as plt


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "frontend_demo" / "assets"
PROCESSED = ROOT / "paper_reproduction" / "outputs" / "processed" / "processed_layers.gpkg"
RESULTS = ROOT / "paper_reproduction" / "outputs" / "results"


def setup_axis(figsize=(16, 9)):
    figure, axis = plt.subplots(figsize=figsize, dpi=150)
    figure.subplots_adjust(left=0, right=1, bottom=0, top=1)
    axis.set_axis_off()
    axis.set_aspect("equal")
    return figure, axis


def save_transparent(figure, name: str):
    figure.savefig(OUTPUT / name, transparent=True, pad_inches=0)
    plt.close(figure)


def expand_extent(bounds, aspect_ratio: float):
    min_x, min_y, max_x, max_y = bounds
    center_x = (min_x + max_x) / 2
    center_y = (min_y + max_y) / 2
    width = (max_x - min_x) * 1.08
    height = (max_y - min_y) * 1.08
    if width / height < aspect_ratio:
        width = height * aspect_ratio
    else:
        height = width / aspect_ratio
    return (
        center_x - width / 2,
        center_x + width / 2,
        center_y - height / 2,
        center_y + height / 2,
    )


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    boundary = gpd.read_file(PROCESSED, layer="boundary")
    road = gpd.read_file(PROCESSED, layer="road_walkable")
    green = gpd.read_file(RESULTS / "green_exposure_results.gpkg", layer="green_exposure")
    residential = gpd.read_file(RESULTS / "residential_1515_results.gpkg", layer="residential_1515")

    extent = expand_extent(boundary.total_bounds, 16 / 9)

    figure, axis = setup_axis()
    axis.set_facecolor("#dfe8e2")
    boundary.plot(ax=axis, color="#e9efeb", edgecolor="#8fa29a", linewidth=.55)
    road.plot(ax=axis, color="#a8b5af", linewidth=.12, alpha=.45)
    axis.set_xlim(extent[0], extent[1])
    axis.set_ylim(extent[2], extent[3])
    figure.patch.set_facecolor("#dfe8e2")
    figure.savefig(OUTPUT / "map-base.png", pad_inches=0, facecolor="#dfe8e2")
    plt.close(figure)

    figure, axis = setup_axis()
    qualified = green.loc[green["exposure_qualified"].astype(bool)]
    qualified.plot(ax=axis, color="#5e9b63", edgecolor="#3f7a4b", linewidth=.18, alpha=.78)
    axis.set_xlim(extent[0], extent[1])
    axis.set_ylim(extent[2], extent[3])
    save_transparent(figure, "map-green.png")

    figure, axis = setup_axis()
    passed = residential.loc[residential["meet_1515"].astype(bool)]
    failed = residential.loc[~residential["meet_1515"].astype(bool)]
    passed.plot(ax=axis, color="#246c5b", markersize=.65, alpha=.56)
    failed.plot(ax=axis, color="#c2584f", markersize=1.5, alpha=.85)
    axis.set_xlim(extent[0], extent[1])
    axis.set_ylim(extent[2], extent[3])
    save_transparent(figure, "map-residential.png")

    hero_extent = expand_extent(boundary.total_bounds, 2)
    figure, axis = setup_axis(figsize=(16, 8))
    boundary.plot(ax=axis, color="#214d40", edgecolor="#a4cdbd", linewidth=.5)
    road.plot(ax=axis, color="#a9c7bc", linewidth=.14, alpha=.32)
    qualified.plot(ax=axis, color="#83ba76", edgecolor="none", alpha=.78)
    axis.set_xlim(hero_extent[0], hero_extent[1])
    axis.set_ylim(hero_extent[2], hero_extent[3])
    axis.set_facecolor("#173e34")
    figure.patch.set_facecolor("#173e34")
    figure.savefig(OUTPUT / "lab-hero.png", pad_inches=0, facecolor="#173e34")
    plt.close(figure)


if __name__ == "__main__":
    main()
