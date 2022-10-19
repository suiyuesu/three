/*
 * @Descripttion: 
 * @version: 
 * @Author: 苏
 * @email: 1373842098@qq.com
 * @Date: 2022-10-13 13:57:22
 * @LastEditors: sj
 * @LastEditTime: 2022-10-19 15:18:27
 */

import React, { ReactElement, useEffect, useRef, useState } from 'react';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import styles from './vr.module.css'
import w04 from './RESULT/w04.png'
import w05 from './RESULT/w05.png'
import w06 from './RESULT/w06.png'
import w02 from './RESULT/w02.png'
import w01 from './RESULT/w01.png'
import w03 from './RESULT/w03.png'
import home1_left from './img/home1_left.jpg'
import home1_right from './img/home1_right.jpg'
import home1_top from './img/home1_top.jpg'
import home1_bottom from './img/home1_bottom.jpg'
import home1_front from './img/home1_front.jpg'
import home1_back from './img/home1_back.jpg'

import home2_left from './img/home2_left.jpg'
import home2_right from './img/home2_right.jpg'
import home2_top from './img/home2_top.jpg'
import home2_bottom from './img/home2_bottom.jpg'
import home2_front from './img/home2_front.jpg'
import home2_back from './img/home2_back.jpg'
import { Button, Modal, notification, Radio, Space } from 'antd';

import shy1 from './shy/qian.png'
import shy2 from './shy/hou.png'
import shy3 from './shy/left.png'
import shy4 from './shy/right.png'
import shy5 from './shy/top.png'
import shy6 from './shy/bottom.png'
interface HomeOjb {
  materials: [],
  btnPosition: []
}

let scene: any = null //场景
let loader: any = null
let planeGemetry: any = null // 跳转点
let planeMaterial: any = null// 跳转点


export const Vr = (): ReactElement => {
  const ref = useRef(null)

  const [camera, setCamera] = useState<any>() //摄像机

  const [renderer, setRenderer] = useState<any>() //渲染器

  const [controls, setControls] = useState<any>() //鼠标控制

  const [homeArr, setHomeArr] = useState<any>([]) // 渲染的数据源

  const [currentHome, setCurrentHome] = useState('') // 当前所处房间

  const [clearPre, setClearPre] = useState('') // 记录需要清理的房间的坐标点

  const [setting, setSetting] = useState(false) // 是否正在设置

  const [position, setPosition] = useState<any>() // 设置跳转点

  const [selectHomeVisible, setSelectHomeVisible] = useState(false) //选择跳转场景

  const [selectHome, setSelectHome] = useState('') // 当前选中需要跳转的场景

  const [selectHomeList, setSelectHomeList] = useState<string[]>([]) // 可选房间列表

  const [removeInfo, setRemoveInfo] = useState('') // 需要移除的跳转点信息

  const [res, setRes] = useState<any>({
    home1: {
      image: [home1_left, home1_right, home1_top, home1_bottom, home1_front, home1_back],// 左右前后上下
      target: [
        { name: 'home2', position: [-16, -8, -9] }
      ]
    },
    home2: {
      image: [home2_left, home2_right, home2_top, home2_bottom, home2_front, home2_back],
      target: [
        { name: 'home1', position: [18, -8, -7] },
        { name: 'home3', position: [-7, -18, -18] }
      ]
    },
    home3: {
      image: [w04, 'https://s1.xptou.com/2022/10/14/6348c159dbfc2.jpg', w06, w02, w01, w03],
      target: [
        { name: 'home2', position: [-16, -8, -9] },
        { name: 'home4', position: [-5, -20, -18] }
      ]
    },
    home4: {
      image: [shy3, shy4, shy5, shy6, shy1, shy2,],
      target: [
        { name: 'home1', position: [18, -8, -7] },
        { name: 'home3', position: [-7, -18, -18] }
      ]
    },
  })

  useEffect(() => {
    document.title = 'VR实景'  // 修改小程序的 tabbarTitle
    if (location.search.split('?').length > 1) {
      console.log(location.search.split('?')[1].split('&'));
    }
    init()
  }, [])

  useEffect(() => {
    if (camera && renderer) {
      setControls(new OrbitControls(camera, renderer.domElement))
    }
  }, [camera, renderer])

  useEffect(() => {
    if (controls) {
      initBaseFactor()
    }
  }, [controls])

  useEffect(() => {
    if (currentHome) {
      if (camera && renderer && controls) {
        initHome();
      }
      updateSelectHomeList()
      setSelectHomeVisible(false)
      setSetting(false)
    }
  }, [currentHome])

  useEffect(() => {
    updateSelectHomeList()
  }, [res])

  const updateSelectHomeList = () => { // 更新可跳转点
    if (!currentHome) return
    const already = [currentHome, ...res[currentHome].target.map((v: any) => v.name)]
    setSelectHomeList(Object.keys(res).filter((v: any) => !already.includes(v)))
  }

  useEffect(() => {
    if (selectHomeList.length) { // 有其他场景设置第一个为默认值
      setSelectHome(selectHomeList[0])
    }
  }, [selectHomeList])

  useEffect(() => {
    // 添加跳转点
    if (!setting) return
    const settingPosition: [number, number, number] = [Math.round(position?.x), Math.round(position?.y), Math.round(position?.z)]
    const planeMesh = new THREE.Mesh(planeGemetry, planeMaterial);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    planeMesh.position.set(...settingPosition)
    planeMesh.name = `locationBtn-${selectHome}-${currentHome}`
    planeMesh[getRotate(settingPosition)](0.5 * Math.PI) //调整位置
    scene.add(planeMesh);
    const newRes = {
      ...res,
      [currentHome]: {
        ...res[currentHome],
        target: [...res[currentHome].target, {
          name: selectHome,
          position: [...settingPosition]
        }]
      }
    }
    setRes(newRes)
    setHomeArr(getNewData(newRes))
    setSetting(false)
  }, [position])

  useEffect(() => { //删除跳转点
    if (!removeInfo) return
    scene.remove(scene.getObjectByName(removeInfo))
    const editFrom: any = removeInfo.split('-')[2]
    const editTo: any = removeInfo.split('-')[1]
    const newRes = {
      ...res,
      [editFrom]: {
        ...res[editFrom],
        target: res[editFrom].target.filter((v: any) => v.name != editTo)
      }
    }
    setRes(newRes)
    setHomeArr(getNewData(newRes))
  }, [removeInfo])

  // 设置跳转点的偏移
  const getRotate = (arr: [number, number, number]) => {
    const index = arr.indexOf(Math.max(...arr))
    switch (index) {
      case 0:
        return 'rotateX';
      case 1:
        return 'rotateY';
      case 2:
        return 'rotateZ';
      default:
        return 'rotateX'
    }
  }

  // 处理数据
  const getNewData = (obj: any) => {
    return Object.entries(obj).map((v: any) => {
      return [v[0], {
        ...v[1], image: v[1].image.map((el: any) => {
          const text = loader.load(el)
          return new THREE.MeshBasicMaterial({ map: text, side: THREE.DoubleSide, })
        })
      }]
    })
  }

  const init = () => {
    loader = new THREE.TextureLoader()
    const width = window.innerWidth;
    const height = window.innerHeight
    setHomeArr(getNewData(res))
    setCurrentHome(getNewData(res)[0][0]) // 首次进来的房间
    setClearPre(getNewData(res)[0][0])
    setCamera(new THREE.PerspectiveCamera(90, width / height, 0.1, 1000))    // 初始化相机
    setRenderer(new THREE.WebGLRenderer())   // 初始化渲染器
  }

  const initBaseFactor = () => {
    const width = window.innerWidth;
    const height = window.innerHeight
    scene = new THREE.Scene();
    // 创建聚光灯
    const spotLight = new THREE.SpotLight(0xFFFFFF);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    spotLight.position.set(80, 130, -130);
    spotLight.castShadow = true;
    spotLight.angle = Math.PI / 4;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    spotLight.shadow.penumbra = 0.05
    spotLight.shadow.mapSize.width = 1024;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    spotLight.shadow.mapSize.innerHeight = 1024;
    // 添加聚光灯
    scene.add(spotLight)
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = -0.4;
    renderer.setSize(width, height);
    renderer.setClearColor(new THREE.Color("#dddddd"));
    document.getElementById("threeDemo")!.appendChild(renderer.domElement);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    function onMouseDown(event: any) {
      // 会产生闭包
      const isLeftClick = event.button == 0 //鼠标左键
      const isRightClick = event.button == 2//鼠标右键
      mouse.x = (event.clientX / width) * 2 - 1;
      mouse.y = -(event.clientY / height) * 2 + 1;
      //将平面坐标系转为世界坐标系
      raycaster.setFromCamera(mouse, camera);

      //得到点击的几何体
      const raycasters = raycaster.intersectObjects(scene.children);
      setPosition(raycasters[0].point)
      if (raycasters && raycasters.length && raycasters.some(v => v.object.name.includes('locationBtn'))) {
        const to = raycasters.find(el => el.object.name.includes('locationBtn'))
        if (isLeftClick) {
          // 鼠标左键点击切换场景
          setCurrentHome((v) => {
            setClearPre(v)
            return to?.object.name.split('-')[1] || ''
          })
        }
        // 右键删除
        if (isRightClick) {
          setRemoveInfo(to?.object.name || '')
        }
      }
    }
    //监视鼠标事件
    window.addEventListener("mousedown", onMouseDown, false);
    // 创建controls对象;
    controls.enableDamping = true; //动态阻尼系数 就是鼠标拖拽旋转灵敏度
    controls.minDistance = 0.01;
    controls.maxDistance = 20;
    // 监听控制器的鼠标事件，执行渲染内容
    controls.addEventListener('change', () => {
      renderer.render(scene, camera)
    })
    initHome();
    renderHome();
  }


  const initHome = () => {
    // 切换场景前把之前的物体清除掉
    const homeMesh1 = scene.getObjectByName('homeMesh')
    homeArr.find((v: any) => clearPre == v[0])[1]?.target?.map(((el: any) => el.name))?.forEach((v: string) => {
      scene.remove(scene.getObjectByName(`locationBtn-${v}-${clearPre}`))
    })
    scene.remove(homeMesh1)
    const activeHome = homeArr.find((v: any) => v[0] == currentHome)
    // 创建一个矩形，贴上六张材质图片，模拟室内效果
    const homeGeoMetry = new THREE.BoxGeometry(40, 40, 40);
    const homeMesh = new THREE.Mesh(homeGeoMetry, activeHome[1].image);
    homeMesh.castShadow = true
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    homeMesh.position.set(0, 0, 0);
    homeMesh.geometry.scale(1, 1, -1);
    homeMesh.name = "homeMesh"
    scene.add(homeMesh);

    // 添加一个圆形按钮，点击后跳转到其他房间场景
    planeGemetry = new THREE.CircleGeometry(1.2, 20);
    planeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    // const font = new THREE.TextGeometry('miaoshu ')
    activeHome[1].target.forEach((v: any) => {
      const planeMesh = new THREE.Mesh(planeGemetry, planeMaterial);
      const position: [number, number, number] = v.position
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      planeMesh.position.set(...position)
      planeMesh[getRotate(position)](0.5 * Math.PI) //调整位置
      // 中间是需要跳转的场景，后面是当前场景
      planeMesh.name = `locationBtn-${v.name}-${currentHome}`
      scene.add(planeMesh);
    })
  }

  const renderHome = () => {
    requestAnimationFrame(renderHome);
    renderer.render(scene, camera);
  }

  return (
    <div className={styles.VRContainer}>
      {/* 场景 */}
      <div id="threeDemo" style={{ overflow: 'hidden' }} ref={ref}>
      </div>
      {/* 描述 */}
      <div className={styles.dec}>
        <div className={styles.info}>
          <p> 鼠标左键白圈跳转，右键删除</p>
          <p> 当前房间为{currentHome}</p>
          <p> 描述文案</p>
          <p> 描述文案</p>
          <p> 描述文案</p>
          <p> 描述文案</p>
          <p> 描述文案</p>
          <p> 描述文案</p>
          <p> 描述文案</p>
        </div>
      </div>
      {/* 操作 */}
      <div className={styles.btn}>
        <Button type='primary' style={{
          backgroundColor: setting ? '#f00' : ''
        }} onClick={() => {
          if (!selectHomeList.length) {
            notification.info({
              message: "暂无可跳转的场景"
            })
            return
          }
          setSelectHomeVisible(true)
        }}>
          {setting ? `跳往${selectHome}` : '添加新的跳转点'}
        </Button>
        <Button type='primary' onClick={() => {
          console.log('homeArr', homeArr)
        }}>
          保存设置
        </Button>
      </div>
      <Modal
        title='请选择跳转的对应场景'
        visible={selectHomeVisible}
        onCancel={() => {
          setSelectHomeVisible(false)
          setSetting(false)
        }}
        onOk={() => {
          setSelectHomeVisible(false)
          setSetting(true)
        }}
        maskClosable={false}
      >
        <Radio.Group onChange={(e) => {
          setSelectHome(e.target.value)
        }} value={selectHome}>
          <Space direction="vertical">
            {
              !!selectHomeList.length && selectHomeList.map((v: any) => (
                <Radio key={v} value={v}>{v}</Radio>
              ))
            }

          </Space>
        </Radio.Group>

      </Modal>
    </div>
  );
}
