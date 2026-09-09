import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from './drawer'

describe('Drawer', () => {
  it('renders the content when open', () => {
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Confirmar</DrawerTitle>
            <DrawerDescription>Descripción del drawer</DrawerDescription>
          </DrawerHeader>
          <p>Contenido del drawer</p>
        </DrawerContent>
      </Drawer>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Confirmar')).toBeInTheDocument()
    expect(screen.getByText('Contenido del drawer')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    render(
      <Drawer open={false}>
        <DrawerContent>
          <p>No visible</p>
        </DrawerContent>
      </Drawer>
    )

    expect(screen.queryByText('No visible')).not.toBeInTheDocument()
  })
})