# 小鼠脑图志

文明使用真实的解剖参考切面与单独的合成训练片段。五份练习使用 scene3d.js 的本地几何；它们缺少标本与配准记录，不具有可展示的脑坐标。玩家画出的候选连接和游戏积分不能直接写入审核后的科研贡献。

## 参考底图

Allen Institute for Brain Science, Allen Mouse Brain Common Coordinate Framework v3 (2017 annotation release). Wang Q et al. The Allen Mouse Brain Common Coordinate Framework: A 3D Reference Atlas. Cell (2020). [论文](https://doi.org/10.1016/j.cell.2020.04.007) · [Atlas viewer](https://atlas.brain-map.org/) · [Allen Institute Terms of Use](https://alleninstitute.org/terms-of-use/)

assets/atlas19-ccf.svg is adapted from the 100 µm 2017 annotation volume for research and noncommercial educational use, subject to the Allen Institute's terms. Left is anterior, top is dorsal. Each view is one sagittal plane rather than a projection through multiple planes. The ML indices 51, 40 and 30 are zero-based indices in the 114-voxel left-to-right dimension.

- [Annotation volume](https://download.alleninstitute.org/informatics-archive/current-release/mouse_ccf/annotation/ccf_2017/annotation_100.nrrd). SHA-256 451e6a82f531d3db4b58056d024d3e2311703c2adc15cefa75e0268e7f0e69a4.
- [Allen adult mouse structure hierarchy](https://api.brain-map.org/api/v2/structure_graph_download/1.json). Each color groups descendants of Isocortex, HPF, TH or CB. Fiber tracts are a separate darker mask. Contours are lightly smoothed for display. Colors are specific to this interface.
- [Allen volume axis order](https://brain-map.org/support/documentation/api-allen-brain-connectivity). Voxel axes are AP, SI, LR.
- [Janelia MouseLight](https://www.janelia.org/project-team/mouselight/resources). A real example of traced single neurons spatially registered to a common reference. No MouseLight tracing, image or coordinate was imported.
