# Palm models

The Palm module accepts only protected `.hshmodel` packages. Put the packages
beside the deployed application under `Models/Palm` (or under this folder
during a development run):

| File | Role | Expected input/output |
| --- | --- | --- |
| `palm_blazepalm_full.hshmodel` | fast palm localization | actual graph input `1x192x192x3` (NHWC); MediaPipe/BlazePalm raw SSD outputs |
| `rtmdet_nano_hand.hshmodel` | alternative localization | RTMDet-nano hand model, 320x320 |
| `palm_ccnet.hshmodel` | palm identity embedding | grayscale `1x1x128x128` -> embedding (CCNet is commonly 2048-D) |
| `palm_ppnet.hshmodel` | alternative palm identity embedding | grayscale `1x1x128x128` -> embedding |

The defaults select BlazePalm plus CCNet. The model can be changed from the
Palm processing options without changing code. PPNet is supported as a generic
embedding model when its exported ONNX graph follows the same input contract.

At runtime, an accepted palm is searched in the shared `identity-database.db`.
When the recognition model is available, the palm is embedded: a known match
is emitted with the person's name and identity metadata, otherwise the
embedding is compared with persisted unknown palms using
`UnknownMatchThreshold`. When no recognition model is available, the detector
still stores a detection-only crop as `Unknown Palm #0001` (without an
embedding) so it is visible in the Windows identity manager and can be assigned
to a person; real matching becomes available after adding an embedding sample.

Recommended upstream sources:

- BlazePalm ONNX conversion: <https://github.com/yakhyo/mediapipe-hand-landmark-onnx>
- OpenMMLab RTMDet-nano hand export: <https://download.openmmlab.com/mmpose/v1/projects/rtmposev1/onnx_sdk/rtmdet_nano_8xb32-300e_hand-267f9c8f.zip>
- CCNet ONNX feature extractor: <https://huggingface.co/kyereboatengcaleb/palm-ccnet-onnx>
- PPNet reference implementation: <https://github.com/xuliangcs/ppnet>

All models used by Windows and Service are distributed as `.hshmodel` packages.
The raw ONNX graphs are development inputs only and are not copied to an
application output or customer deployment. If a recognition package is absent,
Palm detection remains available but Palm identity recognition and enrollment
are unavailable. A new model, including an optional replacement embedding
model, must be packaged before it can be selected by runtime.
