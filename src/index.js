import React, { useEffect, useState } from "react";
// import "./style/index.scss";
import "antd/dist/antd.css";
import {
  modelAngle,
  allCameras,
  towerInfo,
  points,
  keyFrames,
  modelHidden,
  opacityModel,
} from "./config/modelConfig";
import { Layout, Menu, Breadcrumb } from "antd";
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { loadjs } from "./util/index";
import { Typography } from "antd";
import {
  VIEW_TOKEN,
  BASE_POINT,
  MODEL_POSITION,
  MODEL_SCALE,
} from "./constant/index";

const { Title } = Typography;
const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

export const Index = ({ option, echarts, Chart, events }) => {
  let { fetch, uuid, version, rect, config, mode } = option;
  let { onAction, onLocation } = events;
  //巡检路线
  var pollingCameras = allCameras.filter((item) => {
    return item.filterArea === true;
  });

  var viewToken = "";
  var viewer3D;
  var marker;
  var wt;
  var extObjMng;
  var ringScanEffects;
  var fireflag = false;
  var cameras3DFlag = false;
  var map;
  var homeFlag = true;
  var skyBoxManager;

  const [collapsed, setCollapsed] = useState(false);
  const onCollapse = (collapsed) => {
    console.log(collapsed);
    setCollapsed(collapsed);
  };

  useEffect(() => {
    loadjs(
      "https://aecore.glodon.com/static/bimface/JSHostConfig.js",
      function (params) {
        loadjs(
          "https://static.bimface.com/api/BimfaceSDKLoader/BimfaceSDKLoader@latest-release.js",
          function (params) {
            // getViewTtoken().then(res=>{
            //模型加载初始化
            viewToken = VIEW_TOKEN;
            var loaderConfig = new BimfaceSDKLoaderConfig();
            // loaderConfig.viewToken = res;
            loaderConfig.viewToken = viewToken;
            BimfaceSDKLoader.load(
              loaderConfig,
              successCallback,
              failureCallback
            );
          }
        );
        // })
      }
    );
  }, []);

  function successCallback(viewMetaData) {
    var domShow = document.getElementById("domId");
    var viewConfig = new Glodon.Bimface.Viewer.Viewer3DConfig();
    viewConfig.domElement = domShow;
    viewer3D = new Glodon.Bimface.Viewer.Viewer3D(viewConfig);
    viewer3D.addView(viewToken);

    //三维标签的配置类
    // var markerConfig = new Glodon.Bimface.Plugins.Marker3D.Marker3DContainerConfig();
    // markerConfig.viewer = viewer3D;
    // marker = new Glodon.Bimface.Plugins.Marker3D.Marker3DContainer(markerConfig);

    //路径漫游配置
    // var config = new Glodon.Bimface.Plugins.Walkthrough.WalkthroughConfig();
    // config.viewer = viewer3D;
    // wt = new Glodon.Bimface.Plugins.Walkthrough.Walkthrough(config);
    //模型加载的监听事件
    viewer3D.addEventListener(
      Glodon.Bimface.Viewer.Viewer3DEvent.ViewAdded,
      function () {
        //自适应屏幕大小
        window.onresize = function () {
          viewer3D.resize(
            document.documentElement.clientWidth,
            document.documentElement.clientHeight
          );
        };
        loadMap();
        // wt.setKeyFrames(keyFrames);
        // hideViewHouse()
        // setCameraStatus(modelAngle.cameraState);
        // setBlueSky()
        // addPath1()
        // lockAxis()
        // getPosition()
        // towerInfo.forEach(item=>{
        // 	addTowerInfo(item)
        // })

        // viewer3D.overrideComponentsOpacityById(opacityModel.modelId, opacityModel.val);
        //隐藏原有的天气盒子的构件
        // viewer3D.hideComponentsById(modelHidden);
      }
    );
  }

  function initSkyBox() {
    // 构造天空盒管理器配置项，并指定Viewer、Option参数
    var skyBoxManagerConfig = new Glodon.Bimface.Plugins.SkyBox.SkyBoxManagerConfig();
    skyBoxManagerConfig.viewer = viewer3D; // 设置自定义天空盒的图片资源
    skyBoxManagerConfig.customizedImage = {
      front:
        "https://static.bimface.com/attach/0d178c31584d432f93b3df90832d6ba1_EnvMap_posz.jpg",
      back:
        "https://static.bimface.com/attach/c02b7114af6d4966b3f1fd7d483fcdd9_EnvMap_negz.jpg",
      left:
        "https://static.bimface.com/attach/6c2f5045467b4c51a4e506524e74a65c_EnvMap_negx.jpg",
      right:
        "https://static.bimface.com/attach/ec541f626f194a979d49ec5f52ca32bb_EnvMap_posx.jpg",
      top:
        "https://static.bimface.com/attach/01700a9a6f7542af8df76bc923b065b9_EnvMap_posy.jpg",
      bottom:
        "https://static.bimface.com/attach/031a2a1a51374fc88fe8acf1d490b7c0_EnvMap_negy.jpg",
    };
    skyBoxManagerConfig.style =
      Glodon.Bimface.Plugins.SkyBox.SkyBoxStyle.CloudySky; // 构造天空盒管理器，构造完成后，场景背景即发生变化
    skyBoxManager = new Glodon.Bimface.Plugins.SkyBox.SkyBoxManager(
      skyBoxManagerConfig
    );
  }

  // 开启自定义的天空盒效果
  function setBlueSky() {
    initSkyBox(); // 将天空盒效果设置为蓝天
    skyBoxManager.setStyle(
      Glodon.Bimface.Plugins.SkyBox.SkyBoxStyle.Customized
    );
    skyBoxManager.enableSkyBox(true);
  }

  function loadMap() {
    var mapConfig = new Glodon.Bimface.Plugins.TileMap.MapConfig();
    mapConfig.viewer = viewer3D;
    // 设置模型载入的基点
    mapConfig.basePoint = BASE_POINT;
    // 设置模型载入基点所对应的经纬度（WGS84）
    // mapConfig.modelPosition = [121.317911,31.202016];
    // mapConfig.modelPosition = [114.02025566511255, 22.526958723638756];
    mapConfig.modelPosition = MODEL_POSITION;
    // 设置模型的旋转弧度值
    mapConfig.modelRotationZ = (0 * Math.PI) / 180;
    // 设置模型零零标高对应的高程值，单位为米
    mapConfig.modelAltitude = 13.0;
    //比例调整
    mapConfig.viewer.setModelScale(
      "",
      mapConfig.basePoint,
      MODEL_SCALE // 缩放比例系数
    );
    // 设置开启DEM
    mapConfig.enableElevationModel = true;
    // 设置地图类型为谷歌不带标签的卫星影像
    mapConfig.mapLayer = "Google_Satellite";
    // 构造地图对象
    map = new Glodon.Bimface.Plugins.TileMap.Map(mapConfig);
  }

  function lockAxis() {
    // 限定角度为15° ~ 90°
    var degreeRange = [Math.PI / 12, Math.PI / 2];
    viewer3D.lockAxis(Glodon.Bimface.Viewer.AxisOption.Z, degreeRange);
  }

  //模型加载失败
  function failureCallback(error) {
    console.log(error);
  }

  //隐藏viewHouse
  function hideViewHouse() {
    viewer3D.hideViewHouse();
  }

  //设置模型视角
  function setCameraStatus(cameraState) {
    viewer3D.setCameraStatus(cameraState);
  }

  //添加cameras摄像头
  function setVideo(vsrc, position) {
    var drawableConfig = new Glodon.Bimface.Plugins.Drawable.DrawableContainerConfig();
    drawableConfig.viewer = viewer3D;
    var drawableContainer = new Glodon.Bimface.Plugins.Drawable.DrawableContainer(
      drawableConfig
    );
    // 创建自定义元素，可以是一个dom element，也可以是个字符串
    var config = new Glodon.Bimface.Plugins.Drawable.CustomItemConfig();
    let cameraVideos = [...document.querySelectorAll(".cameraVideo")];
    cameraVideos.forEach((item) => {
      item.style.display = "none";
      item.pause();
      item.remove();
    });
    var content = document.createElement("video");
    content.src = vsrc;
    content.style.width = "300px";
    content.style.height = "200px";
    content.style.zIndex = 100;
    content.style.cursor = "pointer";
    content.className = "cameraVideo";

    content.controls = true;
    config.content = content;
    config.viewer = viewer3D;
    config.worldPosition = position;
    //生成customItem实例
    var customItem = new Glodon.Bimface.Plugins.Drawable.CustomItem(config);
    content.play();
    drawableContainer.addItem(customItem);
    let allvideo = [...document.querySelectorAll(".bf-drawable-text")];
    allvideo.forEach((val) => (val.style.opacity = 1));
  }

  //起火告警
  function wraning() {
    isCancel(
      true,
      "https://aecore-doc.glodon.com/content/file/96cd8e1c19554d5d996503318305dc11_tmpfire.mp4"
    );
    addFire();
    setTimeout(() => {
      showRingScan();
      fireWraningInfo();
    }, 2000);
  }

  //获取点击的构件位置
  function getPosition() {
    viewer3D.addEventListener(
      Glodon.Bimface.Viewer.Viewer3DEvent.MouseClicked,
      getData
    );
  }
  // //打印位置信息
  function getData(data) {
    console.log(data);
  }

  //火焰
  function addFire() {
    // 构造火焰对象
    var fire = new Glodon.Bimface.Plugins.ParticleSystem.Fire();
    fire.setPosition({
      x: 37772.28736043621,
      y: 38032.044631653385,
      z: -237.96647336282282,
    });
    fire.setScale(3);
    // 将火焰对象以外部构件的方式载入场景内
    extObjMng = new Glodon.Bimface.Viewer.ExternalObjectManager(viewer3D);
    uuid = fire.uuid;
    extObjMng.addObject("fire" + new Date() * 1, fire);
    viewer3D.render();
  }

  //起火告警信息
  function fireWraningInfo() {
    var drawableConfig = new Glodon.Bimface.Plugins.Drawable.DrawableContainerConfig();
    drawableConfig.viewer = viewer3D;
    var drawableContainer = new Glodon.Bimface.Plugins.Drawable.DrawableContainer(
      drawableConfig
    );
    // 创建自定义元素，可以是一个dom element，也可以是个字符串
    var config = new Glodon.Bimface.Plugins.Drawable.CustomItemConfig();
    var content = document.createElement("div");
    content.className = "fireWraningInfo";
    content.style.width = "300px";

    content.style.cursor = "pointer";
    // 设置标签样式
    content.style.border = "solid";
    content.style.borderColor = "#FFFFFF";
    content.style.borderWidth = "2px";
    content.style.borderRadius = "5px";
    content.style.background = "#000";
    // content.style.opacity = "0";
    content.style.display = "flex";
    content.style.flexDirection = "column";
    content.style.justifyContent = "space-around";
    content.style.fontFamily = "PingFangSC-Semibold, PingFang SC;";
    // 设置标签文字内容与样式
    content.innerHTML =
      '<div class="tipTitle" style="color:#FFFFFF; font-size:24px; font-family: PingFangSC-Semibold, PingFang SC; font-weight: 600; margin-left: -100px;">消防警告:&nbsp;&nbsp;<img  style="width: 30px; height: 30px; vertical-align: middle;"  src="https://static-pre.bimface.com/attach/d96a8fd36a754f958ef33488f1f92b6f_地图-手指 (2).png"/> </div> <div style="font-weight: 400; font-size: 14px; font-family: PingFangSC-Semibold, PingFang SC; margin-left:-24px"><span >告警编号:<span>&nbsp;001</span>&nbsp;&nbsp;&nbsp;&nbsp;</span><span>告警类型:<span>&nbsp;消防告警</span></span></div>   <div  style="font-weight: 400; font-size: 14px; font-family: PingFangSC-Semibold, PingFang SC;"><span>告警名称:<span>&nbsp;火警</span>&nbsp;&nbsp;&nbsp;&nbsp;</span><span>告警时间:<span>&nbsp;2020-10-15</span></span></div>  <div  style="font-weight: 400; font-size: 14px; font-family: PingFangSC-Semibold, PingFang SC; margin-left:-50px"><span>处理人:<span>&nbsp;xxx</span>&nbsp;&nbsp;&nbsp;&nbsp;</span><span>处理状态:<span>&nbsp; 已响应</span></span></div>   <div  style="font-weight: 400; font-size: 14px; font-family: PingFangSC-Semibold, PingFang SC; margin-left: -82px"><span>位置信息:<span>&nbsp; 正荣园区休息区</span></div>';

    content.style.color = "#FFFFFF";
    content.style.textAlign = "center";
    content.style.lineHeight = "32px";
    // 设置自定义标签配置
    config.content = content;
    config.viewer = viewer3D;
    config.opacity = 0.6;
    config.worldPosition = {
      x: 59496.22028299526,
      y: 37327.19614138569,
      z: 23447.573787113317,
    };

    //生成customItem实例
    var customItem = new Glodon.Bimface.Plugins.Drawable.CustomItem(config);
    // 添加自定义标签
    drawableContainer.addItem(customItem);
    customItem.onClick(function (item) {
      setCameraStatus(modelAngle.fireDetailState);
    });
  }

  //环状扫描效果
  function showRingScan() {
    //  // 构造环状扫描效果配置项
    var ringScanEffectConfig = new Glodon.Bimface.Plugins.Animation.RingScanEffectConfig();
    // 配置Viewer对象、颜色、持续时间、位置、半径、衰减力度等参数
    ringScanEffectConfig.viewer = viewer3D;
    ringScanEffectConfig.color = new Glodon.Web.Graphics.Color(238, 9, 9, 100);
    ringScanEffectConfig.duration = 5000;
    ringScanEffectConfig.originPosition = {
      x: 38872.4371143373,
      y: 37523.52599319062,
      z: 3076.909760402386,
    };
    ringScanEffectConfig.radius = 20000;
    ringScanEffectConfig.progressive = 50;
    // 构造环状扫描效果对象
    ringScanEffects = new Glodon.Bimface.Plugins.Animation.RingScanEffect(
      ringScanEffectConfig
    );
    ringScanEffects.show();
    fireflag = true;
    viewer3D.render();
  }
  //添加大楼3D标签
  function addTowerInfo(item) {
    var marker3dConfig = new Glodon.Bimface.Plugins.Marker3D.Marker3DConfig();
    marker3dConfig.src = item.imgSrc;
    marker3dConfig.worldPosition = item.position;
    marker3dConfig.size = 180;
    var marker3d = new Glodon.Bimface.Plugins.Marker3D.Marker3D(marker3dConfig);
    marker.addItem(marker3d);
    viewer3D.render();
  }

  //增加摄像头三维标签的方法
  function addItems(item) {
    var marker3dConfig = new Glodon.Bimface.Plugins.Marker3D.Marker3DConfig();
    marker3dConfig.src =
      "https://static-pre.bimface.com/attach/5e0b8df4be344473adeef5fc84f41851_08814b4b901562b3612800050365bdf.png";
    marker3dConfig.worldPosition = item.position;
    //三维标签的提示
    cameras3DFlag = true;
    marker3dConfig.tooltip = item.text;
    marker3dConfig.videoSrc = item.src;
    marker3dConfig.wsposition = item.position;
    var marker3d = new Glodon.Bimface.Plugins.Marker3D.Marker3D(marker3dConfig);
    marker3d.onClick(function (item) {
      destroy();
      setTimeout(() => {
        setVideo(item._config.videoSrc, item._config.worldPosition);
      }, 2000);
    });

    marker.addItem(marker3d);
    viewer3D.render();
  }

  var path1;
  var curveAnimationConfig1;
  var curveAnimation1;
  var romaPathMng;

  //巡检路线
  function addPath1() {
    path1 = addCurve1("polyline");
    var extObjMng = new Glodon.Bimface.Viewer.ExternalObjectManager(viewer3D);
    extObjMng.addObject("curve1" + new Date() * 1, path1);
    // 构造曲线动画的配置项
    curveAnimationConfig1 = new Glodon.Bimface.Plugins.Animation.CurveAnimationConfig();
    // 配置Viewer对象、曲线对象、持续时间、动画循环等参数
    curveAnimationConfig1.viewer = viewer3D;
    curveAnimationConfig1.curves = [path1];
    curveAnimationConfig1.time = 5000;
    curveAnimationConfig1.loop = false;
    curveAnimation1 = new Glodon.Bimface.Plugins.Animation.CurveAnimation(
      curveAnimationConfig1
    );
  }

  // 漫游路线
  function roamPath() {
    var curve = addCurve1("spline");
    romaPathMng = new Glodon.Bimface.Viewer.ExternalObjectManager(viewer3D);
    romaPathMng.addObject("curve" + new Date() * 1, curve);
    viewer3D.render();
  }

  // 构造曲线
  function addCurve1(curveType) {
    // 构造曲线对象
    var splineCurve = new Glodon.Bimface.Plugins.Geometry.SplineCurve(points);
    splineCurve.setWidth(10);
    splineCurve.setColor(new Glodon.Web.Graphics.Color(2, 225, 255, 0.6));
    splineCurve.setStyle({
      lineType: "Dashed",
      lineStyle: {
        // 虚线中单个短划线的长度
        dashLength: 2000,
        // 虚线中短划线之间间隙的长度
        gapLength: 100,
      },
    });
    // 样条曲线类型为spline，折线为polyline
    splineCurve.setType(curveType);
    return splineCurve;
  }

  //路径漫游动画播放
  function pathRoam(time) {
    wt.setKeyFrameCallback(keyFrameCallback);
    wt.setWalkthroughTime(time);
    wt.play();
  }

  function keyFrameCallback(idx) {
    switch (idx) {
      case 0:
        roamHoldflag = true;
        forbid(false);
        homeFlag = false;
        break;

      case 23:
        homeFlag = true;
        roamHoldflag = false;
        forbid(true);
        marker.clear();
        romaPathMng.clear();
        // towerInfo.forEach(item=>{
        // 	addTowerInfo(item)
        // })
        ckTabActive(
          {
            pitchImg:
              "https://aecore-doc.glodon.com/content/file/ffa4a69a3b894413969961e503b3a6c4_tmpWechatIMG44.png",
            tagImg: document.querySelector(".pathImg"),
            tag: document.querySelector(".pathRoam"),
          },
          false
        );
        break;
      default:
        break;
    }
  }

  //锁定实视角
  function forbid(flag) {
    viewer3D.enableTranslate(flag);
    viewer3D.enableScale(flag);
    viewer3D.enableOrbit(flag);
  }

  //更换视屏路径显示隐藏
  function isCancel(flag) {
    let cameraVideo = document.querySelector("#cameraVideo");

    if (flag) {
      cameraVideo.style.display = "block";
      cameraVideo.src =
        "https://aecore-doc.glodon.com/content/file/96cd8e1c19554d5d996503318305dc11_tmpfire.mp4";
      cameraVideo.play();
    } else {
      cameraVideo.style.display = "none";
      cameraVideo.src = "";
    }
  }

  //销毁模型效果
  function destroy() {
    let destroyComponent = new Glodon.Bimface.Plugins.ExternalObject.ExternalObjectManager(
      viewer3D
    );
    destroyComponent.clear();
    let fireWraningInfo = document.querySelector(".bf-drawable-contentwrap");
    fireWraningInfo && fireWraningInfo.remove();
  }

  function backAngle() {
    if (!roamTabFlag && !homeFlag) {
      alert("请稍等漫游结束");
    } else {
      setCameraStatus(modelAngle.cameraState);
    }
  }

  //清除摄像头3D标签
  function clearMonitoring(size) {
    var getAllItems = marker.getAllItems().filter((item) => item.size === size);
    getAllItems.forEach((item) => {
      marker.removeItemById(item.id);
    });
  }

  //消防告警模型开关函数
  function fireFlag(flag) {
    if (flag) {
      if (cameras3DFlag) {
        clearMonitoring(30);
      }

      cameras3DFlag = false;
      setCameraStatus(modelAngle.fireState);
      wraning();
    } else {
      setCameraStatus(modelAngle.cameraState);
      isCancel(false);
      destroy();
      ringScanEffects.hide();
    }
  }
  //侧边栏点击高亮背景与图片点击切换
  function ckTabActive(domData, flag) {
    allCancel();
    if (flag) {
      domData.tag.style.opacity = 0.6;
      domData.tagImg.src = domData.pitchImg;
    } else {
      domData.tag.style.opacity = 0.35;
      domData.tagImg.src = domData.pitchImg;
    }
  }
  //侧边栏高亮取消
  function allCancel() {
    let btns = [...document.querySelectorAll(".bgbox")];
    let btnList = document.querySelector(".btnList");
    let btnImg = [...btnList.querySelectorAll("img")].slice(1);
    let ImgArr = [
      "https://aecore-doc.glodon.com/content/file/6c2b134c73984398817ef63a57ab717d_tmptest4.png",
      "https://aecore-doc.glodon.com/content/file/6ba776b1b7cb4311978f5c5d1308a5a5_tmpWechatIMG45.png",
      "https://aecore-doc.glodon.com/content/file/ffa4a69a3b894413969961e503b3a6c4_tmpWechatIMG44.png",
    ];
    btns.forEach((val) => (val.style.opacity = 0.35));
    btnImg[0].src = ImgArr[0];
    btnImg[1].src = ImgArr[1];
    btnImg[2].src = ImgArr[2];
  }

  //火警tab开关1
  let fireTabflag = false;
  //视屏监控Tab开关2
  let videTabflag = true;
  //巡检路线开关3
  let pollingTabflag = true;
  //路径漫游开关
  let roamTabFlag = true;
  //漫游开关组禁用
  let roamHoldflag = false;

  //侧边栏状态管理
  function Tab(e) {
    let tagName = e.target.className;
    if (
      roamHoldflag &&
      !tagName.includes("pathRoam") &&
      !tagName.includes("pathImg")
    ) {
      alert("请稍等漫游结束");
      return;
    }

    if (
      tagName.includes("wraningbox") ||
      tagName.includes("wraningImg") ||
      tagName.includes("wraningText")
    ) {
      fireTabflag = fireTabflag ? false : true;
      videTabflag = true;
      pollingTabflag = true;

      destroy();
      allCancel();
      clearMonitoring(30);
      fireFlag(fireTabflag);
    }

    if (
      tagName.includes("videoImg") ||
      tagName.includes("videoMonitoring") ||
      tagName.includes("videoBox")
    ) {
      fireTabflag = false;
      pollingTabflag = true;

      let tag = document.querySelector(".videoMonitoring");
      let tagImg = document.querySelector(".videoImg");

      if (fireflag) {
        ringScanEffects.hide();
      }

      if (videTabflag) {
        setCameraStatus(modelAngle.camera3DState);
        allCameras.forEach((item) => {
          addItems(item);
        });
      } else {
        setCameraStatus(modelAngle.cameraState);
        clearMonitoring(30);
      }
      ckTabActive(
        {
          pitchImg: videTabflag
            ? "https://aecore-doc.glodon.com/content/file/afae08e75eb44ae688ad8331555961ef_tmpWechatIMG43.png"
            : "https://aecore-doc.glodon.com/content/file/6c2b134c73984398817ef63a57ab717d_tmptest4.png",
          tag: tag,
          tagImg: tagImg,
        },
        videTabflag ? true : false
      );
      videTabflag = videTabflag ? false : true;

      destroy();
      isCancel(false);
    }

    if (
      tagName.includes("pollingBox") ||
      tagName.includes("pollImg") ||
      tagName.includes("pollingPath")
    ) {
      destroy();
      addPath1();
      fireTabflag = false;
      videTabflag = true;

      curveAnimation1.stop();
      let tag = document.querySelector(".pollingPath");
      let tagImg = document.querySelector(".pollImg");
      if (fireflag) {
        ringScanEffects.hide();
      }
      clearMonitoring(30);
      if (pollingTabflag) {
        setCameraStatus(modelAngle.pollingPathState);
        pollingCameras.forEach((item, index) => {
          addItems(item);
        });
        curveAnimation1.play();
      } else {
        // 停止动画
        setCameraStatus(modelAngle.cameraState);
        curveAnimation1.stop();
      }

      ckTabActive(
        {
          pitchImg: pollingTabflag
            ? "https://aecore-doc.glodon.com/content/file/bd12185f7a854b5a9e1c50696e9d5028_tmptest.png"
            : "https://aecore-doc.glodon.com/content/file/6ba776b1b7cb4311978f5c5d1308a5a5_tmpWechatIMG45.png",
          tag: tag,
          tagImg: tagImg,
        },
        pollingTabflag ? true : false
      );
      pollingTabflag = pollingTabflag ? false : true;
      cameras3DFlag = false;
      isCancel(false);
    }

    if (tagName.includes("pathRoam") || tagName.includes("pathImg")) {
      let tag = document.querySelector(".pathRoam");
      let tagImg = document.querySelector(".pathImg");
      pollingTabflag = true;
      destroy();
      if (fireflag) {
        ringScanEffects.hide();
      } else if (pollingTabflag) {
        curveAnimation1.stop();
      }
      clearMonitoring(30);
      cameras3DFlag = false;
      isCancel(false);
      if (roamTabFlag) {
        roamPath();
        pathRoam(50);
      } else {
        destroy();
        wt.stop();
        setCameraStatus(modelAngle.cameraState);
        roamHoldflag = false;
        forbid(true);
      }
      roamTabFlag = roamTabFlag ? false : true;

      ckTabActive(
        {
          pitchImg: roamTabFlag
            ? "https://aecore-doc.glodon.com/content/file/ffa4a69a3b894413969961e503b3a6c4_tmpWechatIMG44.png"
            : "https://aecore-doc.glodon.com/content/file/40e72c673d3640548ed18fd5fb554c15_tmptest1.png",
          tagImg: tagImg,
          tag: tag,
        },
        roamTabFlag ? false : true
      );
    }
  }

  function navSkip(e) {
    let target = e.target.className;
    if (target.includes("security")) {
      onLocation(
        "https://aecore.glodon.com/static/datavp/#/share/M%2FRr03UUfhnHvjjtunYQJHsFZowru9kJjCLmARyayW97%2FftVhLa2zERqWN2H0YjW"
      );
    } else if (target.includes("peopleAdmin")) {
      onLocation(
        "https://aecore.glodon.com/static/datavp/#/share/eTK1hSDDHnzbShYygfsChzgwZCn9A3dTxVZUR8P0qMFTIaloWTo864spye%2BbGAiM"
      );
    } else if (target.includes("equipmentAdmin")) {
      onLocation(
        "https://aecore.glodon.com/static/datavp/#/share/wMOCVX5vnBSMXCSlcekf8Lzodl1oxg0Nefhq%2BtINXqu14UujPvavg6dYgX%2FNFWim"
      );
    } else if (target.includes("environment")) {
      onLocation(
        "https://aecore.glodon.com/static/datavp/#/share/VzFp%2BuZIHok7ty8xMohAvoTGs7HM9fAmjbOCX0S9fq60oGxLe%2FKHuW623FsBlD9A"
      );
    }
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
        <div
          className="logo"
          style={{
            color: "#ffffff",
            padding: "12px 18px 0px 18px",
            fontSize: "16px",
          }}
        >
          <span>常态化疫情预警平台</span>
        </div>
        <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
          <Menu.Item key="1" icon={<PieChartOutlined />}>
            主页
          </Menu.Item>
          <SubMenu key="sub1" icon={<UserOutlined />} title="环境要素展示">
            <Menu.Item key="3">人口密度</Menu.Item>
            <Menu.Item key="4">容积率</Menu.Item>
            <Menu.Item key="5">绿地率</Menu.Item>
            <Menu.Item key="51">可达性</Menu.Item>
            <Menu.Item key="52">人流联系</Menu.Item>
          </SubMenu>
          <SubMenu key="sub2" icon={<TeamOutlined />} title="疫情预警">
            <Menu.Item key="6">现有疫情</Menu.Item>
            <Menu.Item key="8">预测</Menu.Item>
            <Menu.Item key="81">重点小区</Menu.Item>
          </SubMenu>
          <SubMenu key="sub3" icon={<TeamOutlined />} title="人员监测">
            <Menu.Item key="91">小区监控</Menu.Item>
            <Menu.Item key="92">人员踪迹模拟</Menu.Item>
          </SubMenu>
        </Menu>
      </Sider>

      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{ padding: 0, background: "#ffffff" }}
        />
        <Content style={{ margin: "0 16px" }}>
          <div
            className="site-layout-background"
            style={{ padding: 24, minHeight: 360 }}
          >
            {/* <div id="warp" style={{ rect }}>
              <div className="overhiddenImg">
                <img
                  src="https://aecore-doc.glodon.com/content/file/afae08e75eb44ae688ad8331555961ef_tmpWechatIMG43.png"
                  alt=""
                />
                <img
                  src="https://aecore-doc.glodon.com/content/file/bd12185f7a854b5a9e1c50696e9d5028_tmptest.png"
                  alt=""
                />
                <img
                  src="https://aecore-doc.glodon.com/content/file/40e72c673d3640548ed18fd5fb554c15_tmptest1.png"
                  alt=""
                />
              </div> */}
            {/* <div
                className="btnList"
                onClick={(e) => {
                  Tab(e);
                }}
              >
                <div title="消防报警" className="wraningbox">
                  <img
                    className="wraningImg"
                    src="https://aecore-doc.glodon.com/content/file/a2b59a5937374f58bd32e1537f732247_tmpWechatIMG46.png"
                  />
                  <p className="wraningText">消防报警</p>
                </div>
                <div title="视屏监控" className="videoBox">
                  <div className="videoMonitoring bgbox"></div>
                  <img
                    className="videoImg"
                    src="https://aecore-doc.glodon.com/content/file/6c2b134c73984398817ef63a57ab717d_tmptest4.png"
                    alt=""
                  />
                </div>
                <div title="巡检路线" className="pollingBox">
                  <div className="pollingPath bgbox"></div>
                  <img
                    className="pollImg"
                    src="https://aecore-doc.glodon.com/content/file/6ba776b1b7cb4311978f5c5d1308a5a5_tmpWechatIMG45.png"
                    alt=""
                  />
                </div>
                <div title="路径漫游" className="pathBox">
                  <div className="pathRoam bgbox"></div>
                  <img
                    className="pathImg"
                    src="https://aecore-doc.glodon.com/content/file/ffa4a69a3b894413969961e503b3a6c4_tmpWechatIMG44.png"
                    alt=""
                  />
                </div>
              </div> */}

            {/* <video
                src="https://aecore-doc.glodon.com/content/file/96cd8e1c19554d5d996503318305dc11_tmpfire.mp4"
                id="cameraVideo"
                controls
              ></video> */}

            <div id="domId"></div>
            {/* <div className="leftMask">
                <img
                  src="https://aecore-doc.glodon.com/content/file/7374df77d0ee447d9effb9e484017c45_tmpleft1.png"
                  alt=""
                />
              </div>
              <div className="rightMask">
                <img
                  src="https://aecore-doc.glodon.com/content/file/26ce03a9dd17461893676e964cb2d496_tmpright1.png"
                  alt=""
                />
              </div> */}

            {/* <div
                className="home"
                onClick={() => {
                  backAngle();
                }}
              >
                <img
                  src="https://aecore-doc.glodon.com/content/file/c2043d7c96de48c2b8024271a7a24644_tmphome.png"
                  alt=""
                />
              </div> */}

            {/* <div className="nav-wrap">
                <div className="bgBox"></div>
                <div className="bannerBox" onClick={(e) => navSkip(e)}>
                  <a className="security" style={{ color: "#FF7C02" }}>
                    环境展示
                  </a>
                  <a className="peopleAdmin">疫情预警</a>
                  <a className="equipmentAdmin">人员监测</a>
                </div>
                <div className="navBox">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1920"
                    height="56"
                    viewBox="0 0 1920 56"
                  >
                    <defs>
                      <linearGradient
                        id="导航-a"
                        x1="139%"
                        x2="0%"
                        y1="49.959%"
                        y2="50.041%"
                      >
                        <stop offset="0%" stopColor="#02E1FF" />
                        <stop offset="100%" stopColor="#202439" />
                      </linearGradient>
                    </defs>
                    <g
                      fill="none"
                      fillRule="evenodd"
                      stroke="url(#导航-a)"
                      strokeWidth="2"
                      opacity=".8"
                      transform="translate(0 1)"
                    >
                      <polyline points="486 0 471.018 14 0 14" />
                      <polyline
                        points="486 40 471.018 54 0 54"
                        transform="matrix(1 0 0 -1 0 94)"
                      />
                      <polyline
                        points="1920 0 1905.018 14 1434 14"
                        transform="matrix(-1 0 0 1 3354 0)"
                      />
                      <polyline
                        points="1920 40 1905.018 54 1434 54"
                        transform="rotate(180 1677 47)"
                      />
                    </g>
                  </svg>
                </div>
              </div> */}
            {/* </div> */}
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          赛博紫荆队 · 常态化疫情预警平台
        </Footer>
      </Layout>
    </Layout>
  );
};
