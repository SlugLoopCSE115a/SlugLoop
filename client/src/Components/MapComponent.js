import React, {useState, useEffect, useContext, useRef} from 'react'
import {getAllBuses, getAllMetroBuses} from './firebase'
import GoogleMap from 'google-maps-react-markers'
import {Box, Modal,} from '@mui/material'
import MapMarker from './MapMarker'
import BusStopMarker from './BusStopMarker'
import {isBusUpdatedWithinPast30Minutes} from './helper'
import RouteSelector from './RouteSelector'
import {RouteContext} from '../Route'
import MainWizard from './Wizard/MainWizard'
import InstallPWAButton from './PwaButton'
import SettingsDrawer from './SettingsDrawer'
import AppContext from '../appContext'
import busStops from './bus-stops.json'
import {AnimatePresence} from 'framer-motion'
import Page from './Page'
import { getSoonBusStops } from './firebase'

export default function MapComponent({center, zoom}) {
  const [displayTime, setDisplayTime] = useState(true)
  const {darkMode} = useContext(AppContext)
  const [filter, setFilter] = useState(true) // If true, only displays buses from last 30 minutes

  // Wizard State
  const [wizardOpen, setWizardOpen] = useState(
    localStorage.getItem('wizard') !== 'false',
  )

  // Stores the buses in a state variable to rerender


  const [buses, setBuses] = useState([])
  const [metroBuses, setMetroBuses] = useState([])
  const combinedBuses = buses.concat(metroBuses)
  const [selectedRoute] = useContext(RouteContext)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [stop,displayStop] = useState('')
  const [soon, setSoon] = useState(false)
  const [isClockwise, setDirection] = useState(true)
  const [soonStops,setSoonStops] = useState([])
  const cwStops = busStops.bstop.CW
  const ccwStops = busStops.bstop.CCW
  function toggleDisplayTime() {
    setDisplayTime(!displayTime)
  }

  function handleFilterToggle() {
    setFilter(!filter)
  }
  const handleDrawerOpen = () => {
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
  }

  useEffect(() => {
    let interval, interval2

    const fetchData = () => {
      getAllBuses().then((busses) => {
        setBuses(busses)
      })
    }
    const fetchMetroData = () => {
      getAllMetroBuses().then((buses) => {
        setMetroBuses(buses)
      })
    }

    const setupIntervals = () => {
      // Update positions of markers every 5 seconds
      interval = setInterval(fetchData, 5000)
      interval2 = setInterval(fetchMetroData, 12000)
    }

    const clearIntervals = () => {
      clearInterval(interval)
      clearInterval(interval2)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData()
        fetchMetroData()
        clearIntervals() // Clear existing intervals
        setupIntervals() // Set up new intervals
      } else {
        clearIntervals() // Clear intervals when the app loses focus
      }
    }

    // Initial load of markers
    fetchData()
    fetchMetroData()

    setupIntervals()

    // Add event listeners to handle app focus and blur events
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearIntervals()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [center])
 
  const initialLoad = useRef(true)
  useEffect(() => {
    const getStopInfo = () => {
      getSoonBusStops().then((stops) => {
        setSoonStops(stops)
      })
      if (isClockwise) {
        setSoon(soonStops[1][stop])
      }
      else {
        setSoon(soonStops[0][stop])
      }


    }
    if (initialLoad.current) {
      initialLoad.current = false
      getSoonBusStops().then((stops) => {
        setSoonStops(stops)
      })
    }
    else {
      getStopInfo()
    }
  }, [stop, isClockwise, soonStops])
  return (
    <>
      <Box id="map" width="100%" height="100vh" data-testid="map">
        <GoogleMap
          apiKey={process.env.REACT_APP_GOOGLE_MAP_KEY}
          defaultCenter={center}
          defaultZoom={zoom}
          key={darkMode ? 'dark' : 'light'}
          options={{
            zoomControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            mapTypeControl: false,
            styles: getStyle(darkMode),
          }}
        >
          {Object.keys(combinedBuses)
            .filter(
              // Filter out buses that haven't updated in the last 30 minutes
              (key) =>
                !filter ||
                isBusUpdatedWithinPast30Minutes(combinedBuses[key].lastPing),
            )
            .filter(
              // Filter out buses that don't match the selected routes
              (key) => selectedRoute.includes(combinedBuses[key].route),
            )
            .map((key) => {
              const bus = combinedBuses[key]
              return (
                <MapMarker
                  key={key}
                  lat={parseFloat(bus.lastLatitude)}
                  lng={parseFloat(bus.lastLongitude)}
                  direction={bus.direction}
                  lastPing={bus.lastPing}
                  fleetId={bus.fleetId}
                  route={bus.route}
                  heading={bus.heading}
                  displayTime={displayTime}
                  darkMode={darkMode}
                />
              )
            })}
          {cwStops
            .map((key) => {
              const stop = Object.keys(key)[0]
              return (
                <Box
                lat={key[stop].lat}
                lng={key[stop].lon}
                onClick = {()=>{handleDrawerOpen(); console.log(stop);displayStop(stop); setDirection(true)}}>
                <BusStopMarker
                  sx ={{position: 'aboslute' ,transform: 'translate(-50%,-50%)'}}
                  
                />
                </Box>
                 
              )
            })
          }
          {ccwStops
            .map((key) => {
              const stop = Object.keys(key)[0]
              return (
                <Box
                  lat={key[stop].lat}
                  lng={key[stop].lon}
                  onClick={() => { handleDrawerOpen(); displayStop(stop); setDirection(false) }}
                >
                  <BusStopMarker
                    sx={{ position: 'aboslute', transform: 'translate(-50%,-50%)' }}

                  />
                </Box>
                
              )
            })
            }
        </GoogleMap>
        
      </Box>
      <Modal
        anchor="bottom"
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        sx={{
          width: '50%',
          display: 'flex',
          left: '25%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Page busStop={stop} isClockwise={isClockwise} soon={soon} />
      </Modal>
      <AnimatePresence mode="wait">
        {wizardOpen && (
          <MainWizard
            closeWizard={() => setWizardOpen(false)}
            neverShowAgain={() => {
              localStorage.setItem('wizard', false)
              setWizardOpen(false)
            }}
          />
        )}
      </AnimatePresence>
      <SettingsDrawer
        filter={filter}
        handleFilterToggle={handleFilterToggle}
        displayTime={displayTime}
        toggleDisplayTime={toggleDisplayTime}
        darkMode={darkMode}
      />
      <InstallPWAButton />
      <RouteSelector />
    </>
  )
}

const getStyle = (darkMode) => {
  if (darkMode) {
    return [
      {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#38414e'}],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{color: '#212a37'}],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{color: '#9ca5b3'}],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#746855'}],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#1f2835'}],
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{color: '#f3d19c'}],
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{color: '#2f3948'}],
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{color: '#17263c'}],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#515c6d'}],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{color: '#17263c'}],
      },
      {
        featureType: 'poi',
        stylers: [{visibility: 'off'}],
      },
      {
        featureType: 'poi.school',
        stylers: [{visibility: 'on'}], // This will show only schools
      },
    ]
  }
  return [
    {
      featureType: 'poi',
      stylers: [{visibility: 'off'}],
    },
    {
      featureType: 'poi.school',
      stylers: [{visibility: 'on'}], // This will show only schools
    },
  ]
}
