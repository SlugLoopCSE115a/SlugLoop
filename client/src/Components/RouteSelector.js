import React, {useContext, useState} from 'react'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Checkbox,
  ListItemIcon,
  Drawer,
  IconButton,
} from '@mui/material'
import {ExpandLess, ExpandMore, Menu as MenuIcon} from '@mui/icons-material'
import {RouteContext} from '../Route'
import routeColors from './bus.json'

const metroRoutes = ['10', '15', '18', '19', '20']
const loopRoutes = [
  'LOOP',
  'UPPER CAMPUS',
  'LOOP OUT OF SERVICE AT BARN THEATER',
  'OUT OF SERVICE/SORRY',
  'SPECIAL',
]

export default function RouteSelector() {
  const [selectedRoute, setSelectedRoute] = useContext(RouteContext)
  const [open, setOpen] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const handleDrawerOpen = () => {
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
  }

  const handleToggle = (value) => {
    setOpen(value)
  }

  const RouteSelectorList = (routes, value) => (
    <Collapse in={open === value} timeout="auto" unmountOnExit>
      <List component="div" disablePadding>
        {routes.map((route) => (
          <ListItemButton
            key={route}
            onClick={() => {
              if (selectedRoute.includes(route)) {
                setSelectedRoute(selectedRoute.filter((r) => r !== route))
              } else {
                setSelectedRoute([...selectedRoute, route])
              }
            }}
            sx={{
              padding: 0,
              paddingTop: '5px',
              paddingBottom: '5px',
            }}
          >
            <Checkbox checked={selectedRoute.includes(route)} />
            <ListItemText primary={route} />
            <ListItemIcon>
              <img
                src={routeColors[route]}
                alt="bus"
                style={{width: '20px', height: '20px'}}
              />
            </ListItemIcon>
          </ListItemButton>
        ))}
      </List>
    </Collapse>
  )

  const CustomListItem = (value) => (
    <ListItem onClick={() => handleToggle(value)}>
      <ListItemText primary={value} />
      {open === value ? <ExpandLess /> : <ExpandMore />}
    </ListItem>
  )

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={handleDrawerOpen}
        sx={{
          position: 'absolute',
          top: '30px',
          right: '30px',
          borderRadius: '50%',
          backgroundColor: 'white',
        }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer anchor="right" open={isDrawerOpen} onClose={handleDrawerClose}>
        <List
          sx={{
            width: '300px',
          }}
        >
          <ListItem
            onClick={() => {
              if (open === 'Loop') {
                setOpen('')
              } else {
                setOpen('Loop')
              }
            }}
          >
            <ListItemText primary="Loop" />
            {open === 'Loop' ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open === 'Loop'} timeout="auto" unmountOnExit>
            {loopRoutes.map((route) => (
              <ListItemButton
                key={route}
                onClick={() => {
                  if (selectedRoute.includes(route)) {
                    setSelectedRoute(selectedRoute.filter((r) => r !== route))
                  } else {
                    setSelectedRoute([...selectedRoute, route])
                  }
                }}
                sx={{
                  padding: 0,
                  paddingTop: '5px',
                  paddingBottom: '5px',
                }}
              >
                <Checkbox checked={selectedRoute.includes(route)} />
                <ListItemText primary={route} />
                <ListItemIcon>
                  <img
                    src={routeColors[route]}
                    alt="bus"
                    style={{width: '20px', height: '20px'}}
                  />
                </ListItemIcon>
              </ListItemButton>
            ))}
          </Collapse>
          <ListItem
            onClick={() => {
              if (open === 'Metro') {
                setOpen('')
              } else {
                setOpen('Metro')
              }
            }}
          >
            <ListItemText primary="Metro" />
            {open === 'Metro' ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open === 'Metro'} timeout="auto" unmountOnExit>
            {metroRoutes.map((route) => (
              <ListItemButton
                key={route}
                onClick={() => {
                  if (selectedRoute.includes(route)) {
                    setSelectedRoute(selectedRoute.filter((r) => r !== route))
                  } else {
                    setSelectedRoute([...selectedRoute, route])
                  }
                }}
                sx={{
                  padding: 0,
                  paddingTop: '5px',
                  paddingBottom: '5px',
                }}
              >
                <Checkbox checked={selectedRoute.includes(route)} />
                <ListItemText primary={route} />
                <ListItemIcon>
                  <img
                    src={routeColors[route]}
                    alt="bus"
                    style={{width: '20px', height: '20px'}}
                  />
                </ListItemIcon>
              </ListItemButton>
            ))}
          </Collapse>
          <ListItemButton
            onClick={() => {
              setSelectedRoute([])
            }}
          >
            <ListItemText primary="Clear Routes" />
          </ListItemButton>
        </List>
      </Drawer>
    </>
  )
}
