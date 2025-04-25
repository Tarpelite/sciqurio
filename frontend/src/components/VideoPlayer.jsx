import React, { useState, useRef, useEffect } from 'react';
import { Card, Typography, Button, Slider, Space, Tooltip } from 'antd';
import { 
  PlayCircleFilled, 
  PauseCircleFilled, 
  SoundOutlined, 
  FullscreenOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * 可复用的视频播放器组件
 * @param {string} src - 视频源URL
 * @param {string} title - 视频标题
 * @param {string} link - 标题链接URL
 * @param {string} description - 视频描述
 * @param {boolean} autoPlay - 是否自动播放
 * @param {boolean} controls - 是否显示浏览器默认控件
 * @param {function} onEnded - 视频播放结束的回调函数
 */
const VideoPlayer = ({ 
  src, 
  title, 
  link,
  description, 
  autoPlay = true,
  controls = false,
  onEnded = () => {}
}) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 处理自动播放（考虑浏览器策略）
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      const video = videoRef.current;
      // 大多数浏览器要求自动播放的视频必须静音
      video.muted = true;
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // 自动播放成功
            setPlaying(true);
            // 保持静音状态，不再尝试取消静音
          })
          .catch(error => {
            // 自动播放被阻止
            console.log("自动播放被阻止:", error);
            setPlaying(false);
          });
      }
    }
  }, [autoPlay]);

  // 更新播放进度
  useEffect(() => {
    const video = videoRef.current;
    const updateProgress = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setPlaying(false);
      onEnded();
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onEnded]);

  // 播放/暂停控制
  const togglePlay = () => {
    const video = videoRef.current;
    if (playing) {
      video.pause();
    } else {
      video.play();
    }
    setPlaying(!playing);
  };

  // 进度条控制
  const handleProgressChange = (value) => {
    const video = videoRef.current;
    video.currentTime = value;
    setCurrentTime(value);
  };

  // 音量控制
  const handleVolumeChange = (value) => {
    const video = videoRef.current;
    video.volume = value;
    setVolume(value);
  };

  // 全屏控制
  const handleFullscreen = () => {
    const video = videoRef.current;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen();
    }
  };

  // 重新播放
  const handleRestart = () => {
    const video = videoRef.current;
    video.currentTime = 0;
    video.play();
    setPlaying(true);
  };

  // 格式化时间
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 处理视频加载完成事件
  const handleLoadedData = () => {
    setLoading(false);
  };
  
  // 处理视频结束事件
  const handleVideoEnded = () => {
    if (onEnded && typeof onEnded === 'function') {
      onEnded();
    }
  };

  return (
    <Card 
      variant="bordered"
      className="video-player-container"
      styles={{
        header: { padding: '16px 24px' },
        body: { 
          padding: '0 0 16px 0',
          minHeight: '400px' 
        }
      }}
    >
      <div style={{ 
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%', // 16:9 纵横比
        background: '#f0f0f0'
      }}>
        <video
          ref={videoRef}
          src={src}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%', 
            height: '100%',
            objectFit: 'contain',
            backgroundColor: '#000',
            borderRadius: '8px 8px 0 0'
          }}
          autoPlay={autoPlay}
          controls={controls}
          onClick={togglePlay}
          playsInline
          onLoadedData={handleLoadedData}
          onEnded={handleVideoEnded}
          preload="auto"
          muted={true}
        />

        {/* 自定义控制器 */}
        {!controls && (
          <div 
            style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              padding: '16px',
              borderRadius: '0 0 8px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <Slider 
              value={currentTime} 
              max={duration || 100} 
              onChange={handleProgressChange} 
              tooltip={{ open: false }}
              style={{ margin: '0 0 8px 0' }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Button 
                  type="text" 
                  icon={playing ? <PauseCircleFilled /> : <PlayCircleFilled />} 
                  onClick={togglePlay}
                  style={{ color: '#fff' }}
                />
                
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={handleRestart}
                  style={{ color: '#fff' }}
                />
                
                <div 
                  style={{ 
                    display: 'inline-block', 
                    position: 'relative',
                    marginLeft: '4px'
                  }}
                  onMouseEnter={() => setShowVolumeControl(true)}
                  onMouseLeave={() => setShowVolumeControl(false)}
                >
                  <Button
                    type="text"
                    icon={<SoundOutlined />}
                    style={{ color: '#fff' }}
                  />
                  
                  {showVolumeControl && (
                    <div 
                      style={{ 
                        position: 'absolute', 
                        bottom: '40px', 
                        left: '0',
                        background: 'rgba(0,0,0,0.7)', 
                        padding: '12px 8px',
                        borderRadius: '4px',
                        width: '40px',
                        height: '120px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <Slider 
                        vertical 
                        value={volume} 
                        min={0} 
                        max={1} 
                        step={0.1} 
                        onChange={handleVolumeChange} 
                        style={{ height: '100px', margin: '0 auto' }} 
                      />
                    </div>
                  )}
                </div>
                
                <Text style={{ color: '#fff', marginLeft: '16px' }}>
                  {formatTime(currentTime)} / {formatTime(duration || 0)}
                </Text>
              </div>
              
              <div>
                <Tooltip title="全屏">
                  <Button
                    type="text"
                    icon={<FullscreenOutlined />}
                    onClick={handleFullscreen}
                    style={{ color: '#fff' }}
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 视频信息 */}
      {(title || description) && (
        <div style={{ padding: '16px' }}>
          {title && 
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Title level={4} style={{ margin: '0 0 8px 0' }}>
                {title}
              </Title>
              {link && (
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, color: '#1677ff', marginLeft: 4 }}
                >
                  【查看详情】
                </a>
              )}
            </div>
          }
          {description && <Text type="secondary">{description}</Text>}
        </div>
      )}
    </Card>
  );
};

export default VideoPlayer;