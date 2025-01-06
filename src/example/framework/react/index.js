const { useLayoutEffect, useState, useRef, useEffect, useCallback } = React;

AgoraRTC.onAutoplayFailed = () => {
  alert("click to start autoplay!");
};

$(function () {
  const MicSelect = function (props) {
    const { audioTrack } = props;

    const [items, setItems] = useState([
      {
        label: "Default",
        value: "default",
        deviceId: "",
      },
    ]);
    const [curValue, setCurValue] = useState("default");

    useEffect(() => {
      AgoraRTC.onMicrophoneChanged = async (changedDevice) => {
        const devices = await AgoraRTC.getMicrophones();
        setItems(
          devices.map((item) => ({
            label: item.label,
            key: item.deviceId,
            deviceId: "",
          })),
        );
        if (audioTrack) {
          if (changedDevice.state === "ACTIVE") {
            // When plugging in a device, switch to a device that is newly plugged in.
            await audioTrack.setDevice(changedDevice.device.deviceId);
            setCurValue(audioTrack?.getTrackLabel());
          } else if (changedDevice.device.label === curValue) {
            // Switch to an existing device when the current device is unplugged.
            if (devices[0]) {
              await audioTrack.setDevice(devices[0].deviceId);
              setCurValue(audioTrack?.getTrackLabel());
            }
          }
        }
      };
    }, []);

    useEffect(() => {
      if (audioTrack) {
        const label = audioTrack?.getTrackLabel();
        setCurValue(label);
        AgoraRTC.getMicrophones().then((cams) => {
          setItems(
            cams.map((item) => ({
              label: item.label,
              value: item.label,
              deviceId: item.deviceId,
            })),
          );
        });
      }
    }, [audioTrack]);

    const onChange = async (e) => {
      const target = items.find((item) => item.value === e.target.value);
      if (target) {
        setCurValue(target.value);
        if (audioTrack) {
          // switch device of local audio track.
          await audioTrack.setDevice(target.deviceId);
        }
      }
    };

    return (
      <select class="form-select mic-list" value={curValue} onChange={onChange}>
        {items.map((item) => (
          <option value={item.value}>{item.label}</option>
        ))}
      </select>
    );
  };

  const CamSelect = function (props) {
    const { videoTrack } = props;
    const [items, setItems] = useState([
      {
        label: "Default",
        value: "default",
        deviceId: "",
      },
    ]);
    const [curValue, setCurValue] = useState("default");

    AgoraRTC.onCameraChanged = useCallback(
      async (changedDevice) => {
        const devices = await AgoraRTC.getCameras();
        setItems(
          devices.map((item) => ({
            label: item.label,
            key: item.deviceId,
            deviceId: "",
          })),
        );
        if (videoTrack) {
          if (changedDevice.state === "ACTIVE") {
            // When plugging in a device, switch to a device that is newly plugged in.
            await videoTrack.setDevice(changedDevice.device.deviceId);
            setCurValue(videoTrack?.getTrackLabel());
          } else if (changedDevice.device.label === curValue) {
            // Switch to an existing device when the current device is unplugged.
            if (devices[0]) {
              await videoTrack.setDevice(devices[0].deviceId);
              setCurValue(videoTrack?.getTrackLabel());
            }
          }
        }
      },
      [videoTrack, curValue],
    );

    useEffect(() => {
      if (videoTrack) {
        const label = videoTrack?.getTrackLabel();
        setCurValue(label);
        AgoraRTC.getCameras().then((cams) => {
          setItems(
            cams.map((item) => ({
              label: item.label,
              value: item.label,
              deviceId: item.deviceId,
            })),
          );
        });
      }
    }, [videoTrack]);

    const onChange = async (e) => {
      const target = items.find((item) => item.value === e.target.value);
      if (target) {
        setCurValue(target.value);
        if (videoTrack) {
          // switch device of local audio track.
          await videoTrack.setDevice(target.deviceId);
        }
      }
    };

    return (
      <select class="form-select cam-list" value={curValue} onChange={onChange}>
        {items.map((item) => (
          <option value={item.value}>{item.label}</option>
        ))}
      </select>
    );
  };

  const StreamPlayer = function (props) {
    const {
      // local stream player not need play audioTrack
      audioTrack,
      videoTrack,
      uid = "",
      options = {},
    } = props;

    const videoRef = useRef(null);

    useLayoutEffect(() => {
      if (videoRef.current !== null) {
        videoTrack?.play(videoRef.current, options);
      }
      return () => {
        videoTrack?.stop();
      };
    }, [videoTrack, options]);

    useLayoutEffect(() => {
      audioTrack?.play();
      return () => {
        audioTrack?.stop();
      };
    }, [audioTrack]);

    return (
      <div class="player" ref={videoRef}>
        {uid ? <div class="card-text player-name">uid: {uid}</div> : null}
      </div>
    );
  };

  // global client
  let client = null;

  const App = function () {
    const [videoTrack, setVideoTrack] = useState(null);
    const [audioTrack, setAudioTrack] = useState(null);
    const [createDisabled, setCreateDisabled] = useState(false);
    const [joinDisabled, setJoinDisabled] = useState(true);
    const [publishDisabled, setPublishDisabled] = useState(true);
    const [subscribeDisabled, setSubscribeDisabled] = useState(true);
    const [leaveDisabled, setLeaveDisabled] = useState(true);
    const [mirrorCheckDisabled, setMirrorCheckDisabled] = useState(true);
    const [mirrorChecked, setMirrorChecked] = useState(true);
    const [options, setOptions] = useState(Object.assign({}, getOptionsFromLocal(), { uid: "" }));
    const [remoteUid, setRemoteUid] = useState("");
    const [remoteUsers, setRemoteUsers] = useState({});
    const [audioChecked, setAudioChecked] = useState(true);
    const [videoChecked, setVideoChecked] = useState(true);
    const remoteUsersRef = useRef(remoteUsers);

    useEffect(() => {
    }, [videoTrack]);

    const stepCreate = () => {
      createClient();
      addSuccessIcon("#step-create");
      message.success("Create client success!");
      setCreateDisabled(true);
      setJoinDisabled(false);
    };

    const stepJoin = async () => {
      try {
        options.token = await agoraGetAppData(options);
        await join();
        setOptions(options);
        setOptionsToLocal(options);
        addSuccessIcon("#step-join");
        message.success("Join channel success!");
        setJoinDisabled(true);
        setPublishDisabled(false);
        setSubscribeDisabled(false);
        setLeaveDisabled(false);
        setMirrorCheckDisabled(false);
      } catch (error) {
        message.error(error.message);
        console.error(error);
      }
    };

    const stepPublish = async () => {
      await createTrackAndPublish();
      addSuccessIcon("#step-publish");
      message.success("Create tracks and publish success!");
      setPublishDisabled(true);
      setMirrorCheckDisabled(true);
    };

    const stepSubscribe = () => {
      const user = remoteUsers[remoteUid];
      if (!user) {
        return message.error(`User:${remoteUid} not found!`);
      }
      if (audioChecked) {
        subscribe(user, "audio");
      }
      if (videoChecked) {
        subscribe(user, "video");
      }
      addSuccessIcon("#step-subscribe");
      message.success("Subscribe and Play success!");
    };

    const stepLeave = async () => {
      await leave();
      message.success("Leave channel success!");
      removeAllIcons();
      setJoinDisabled(true);
      setPublishDisabled(true);
      setSubscribeDisabled(true);
      setLeaveDisabled(true);
      setMirrorCheckDisabled(true);
      setCreateDisabled(false);
    };

    const createClient = () => {
      // create Agora client
      client = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });
    };

    const join = async () => {
      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);

      // start Proxy if needed
      const mode = Number(options.proxyMode);
      if (mode != 0 && !isNaN(mode)) {
        client.startProxyServer(mode);
      }

      options.uid = await client.join(
        options.appid,
        options.channel,
        options.token || null,
        options.uid || null,
      );
    };

    const handleUserPublished = (user, mediaType) => {
      const uid = user.uid;
      let users = {
        ...remoteUsersRef.current,
        [uid]: user,
      };
      remoteUsersRef.current = users;
      setRemoteUsers(users);
      setRemoteUid(uid);
    };

    const handleUserUnpublished = (user, mediaType) => {
      if (mediaType === "video") {
        const id = user.uid;
        const newUsers = remoteUsersRef.current;
        delete newUsers[id];
        remoteUsersRef.current = newUsers; 
        setRemoteUsers(newUsers);
        const remainingUid = Object.keys(newUsers);
        setRemoteUid(remainingUid.length > 0 ? remainingUid[0] : "");
      }
    };

    const createTrackAndPublish = async () => {
      // create local audio and video tracks
      const tracks = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: "music_standard",
        }),
        AgoraRTC.createCameraVideoTrack(),
      ]);
      setAudioTrack(tracks[0]);
      setVideoTrack(tracks[1]);
      // publish local tracks to channel
      await client.publish(tracks);
    };

    const subscribe = async (user, mediaType) => {
      // subscribe to a remote user
      await client.subscribe(user, mediaType);

      const uid = user.uid;
      let users = {
        ...remoteUsersRef.current,
        [uid]: user,
      };
      setRemoteUsers(users);
    };

    const leave = async () => {
      if (videoTrack) {
        videoTrack.close();
        setVideoTrack(null);
      }
      if (audioTrack) {
        audioTrack.close();
        setAudioTrack(null);
      }
      // Remove remote users and player views.
      setRemoteUid("");
      setRemoteUsers({});
      // leave the channel
      await client.leave();
    };

    return (
      <>
        {/* <!-- video --> */}
        <div class="video-group col-md-12 col-lg-6">
          {/* <!-- local stream --> */}
          <section class="card">
            <div class="card-header">local stream</div>
            <div class="card-body">
              <StreamPlayer
                videoTrack={videoTrack}
                uid={options.uid}
                options={{
                  mirror: mirrorChecked,
                }}
              ></StreamPlayer>
            </div>
          </section>
          {/* <!-- remote stream --> */}
          <section class="card">
            <div class="card-header">remote stream</div>
            <div class="card-body">
              <div id="remote-playerlist">
                {Object.keys(remoteUsers).map((uid) => {
                  const user = remoteUsers[uid];
                  return (
                    <StreamPlayer
                      key={uid}
                      videoTrack={user.videoTrack}
                      audioTrack={user.audioTrack}
                      uid={uid}
                    ></StreamPlayer>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
        {/* <!-- form --> */}
        <div class="col-lg-6">
          <form id="join-form" name="join-form">
            <div>
              <div class="mt-2">
                <label class="form-label">Channel</label>
                <input
                  class="form-control"
                  id="channel"
                  type="text"
                  placeholder="enter channel name"
                  value={options.channel}
                  onChange={(e) =>
                    setOptions((pre) => ({
                      ...pre,
                      channel: e.target.value,
                    }))
                  }
                  required
                ></input>
                <div class="tips">
                  If you don`t know what is your channel, checkout{" "}
                  <a href="https://docs.agora.io/en/Agora%20Platform/terms?platform=All%20Platforms#channel">
                    this
                  </a>
                </div>
              </div>
              <div class="mt-2">
                <label class="form-label">User ID(optional)</label>
                <input
                  class="form-control"
                  id="uid"
                  type="text"
                  value={options.uid}
                  onChange={(e) =>
                    setOptions((pre) => ({
                      ...pre,
                      uid: e.target.value,
                    }))
                  }
                  onkeyup="this.value=this.value.replace(/[^0-9]/g,'')"
                  onafterpaste="this.value=this.value.replace(/[^0-9]/g,'')"
                  placeholder="Enter the user ID"
                ></input>
              </div>
            </div>
            <div class="mt-2">
              {/* <!-- Step1 --> */}
              <section class="step">
                <label class="form-label  ">
                  <span>Step1</span> Create AgoraRTC Client
                </label>
                <button
                  type="button"
                  id="step-create"
                  class="btn btn-primary btn-sm"
                  disabled={createDisabled}
                  onClick={stepCreate}
                >
                  Create Client
                </button>
              </section>
              {/* <!-- Step2 --> */}
              <section class="step">
                <label class="form-label  ">
                  <span>Step2</span> Join Channel
                </label>
                <button
                  type="button"
                  id="step-join"
                  class="btn btn-primary btn-sm"
                  disabled={joinDisabled}
                  onClick={stepJoin}
                >
                  Join Channel
                </button>
              </section>
              {/* <!-- Step3 --> */}
              <section class="step">
                <label class="form-label  ">
                  <span>Step3</span> Create Track & Publish
                </label>
                <div class="form-check">
                  <span class="form-check-label">Mirror Mode</span>
                  <input
                    class="form-check-input"
                    type="checkbox"
                    value=""
                    id="mirror-check"
                    checked={mirrorChecked}
                    disabled={mirrorCheckDisabled}
                    onChange={(e) => setMirrorChecked(!mirrorChecked)}
                  ></input>
                </div>
                <button
                  type="button"
                  id="step-publish"
                  class="btn btn-primary btn-sm"
                  disabled={publishDisabled}
                  onClick={stepPublish}
                >
                  Create Track & Publish
                </button>
                {/* <!-- audio --> */}
                <label class="form-label mt-2">Microphone</label>
                <MicSelect audioTrack={audioTrack}></MicSelect>
                {/* <!-- video --> */}
                <label class="form-label mt-2">Camera</label>
                <CamSelect videoTrack={videoTrack}></CamSelect>
              </section>
              {/* <!-- Step4 --> */}
              <section class="step">
                <label class="form-label  ">
                  <span>Step4</span> Subscribe & Play
                </label>
                <select
                  class="form-select"
                  value={remoteUid}
                  onChange={(e) => setRemoteUid(e.target.value)}
                  id="remote-uid"
                  style={{ maxWidth: "300px" }}
                >
                  <option value="" disabled>
                    Please select remote userId
                  </option>
                  {Object.keys(remoteUsers).map((uid) => (
                    <option key={uid} value={uid}>
                      {uid}
                    </option>
                  ))}
                </select>
                <div class="mt-2 mb-1">
                  <span class="form-check d-inline-block">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      value=""
                      id="audio-check"
                      checked={audioChecked}
                      onChange={(e) => setAudioChecked(e.target.checked)}
                    ></input>
                    <label class="form-check-label" for="audio-check">
                      Audio
                    </label>
                  </span>
                  <span class="form-check d-inline-block">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      value=""
                      id="video-check"
                      checked={videoChecked}
                      onChange={(e) => setVideoChecked(e.target.checked)}
                    ></input>
                    <label class="form-check-label" for="video-check">
                      Video
                    </label>
                  </span>
                </div>
                <button
                  type="button"
                  id="step-subscribe"
                  class="btn btn-primary btn-sm"
                  disabled={subscribeDisabled}
                  onClick={stepSubscribe}
                >
                  Subscribe & Play
                </button>
              </section>
              {/* <!-- Step5 --> */}
              <section class="step">
                <label class="form-label  ">
                  <span>Step5</span> Leave Channel
                </label>
                <button
                  type="button"
                  id="step-leave"
                  class="btn btn-danger btn-sm"
                  disabled={leaveDisabled}
                  onClick={stepLeave}
                >
                  Leave Channel
                </button>
              </section>
            </div>
          </form>
        </div>
      </>
    );
  };

  const root = ReactDOM.createRoot(document.getElementById("react-wrapper"));
  root.render(<App></App>);
});
