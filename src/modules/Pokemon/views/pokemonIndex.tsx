import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'

import { 
  PokemonsModel,
  PokemonTypes
} from '../typings/pokemonsTypings'
import { pokemonsGraphql } from '../graphql'

import { 
  Row, 
  Col,  
  Divider,
  Tag,
  Button
} from 'antd'

import { 
  FilterOutlined,
  CheckOutlined
} from '@ant-design/icons'

import {
  PLoading,
  PError
} from 'atoms'
import { PCard } from 'molecules'
import { PPageHeader } from 'organisms'
import { 
  PContainer,
  POverlay
} from 'templates'

import { colors } from '@/styles'

export default function PokemonIndex () {
  const [loadMore, setLoadMore] = React.useState(false)
  const [variables, setVariables] = React.useState({ first: 20 })
  const [filteredPokemons, setFilteredPokemons] = React.useState<PokemonsModel[]>([])

  const { loading, error, data, fetchMore } = useQuery(pokemonsGraphql, { variables })
  const pokemons = data && data.pokemons

  function handleScroll () {
    if (document.documentElement.scrollTop > 0) {
      const isBottom = document.documentElement.scrollTop + window.innerHeight === document.documentElement.scrollHeight

      if (!isBottom) return

      fetchMore({
        variables: { first: variables.first + 10 },
        updateQuery: (prev, { fetchMoreResult, variables }) => {
          if (variables) {
            setLoadMore(true)
            setVariables(variables)
          }

          if (!fetchMoreResult) return prev

          return Object.assign({}, prev, {
            pokemons: [...fetchMoreResult.pokemons]
          })
        }
      })
    }
  }

  React.useEffect(() => {
    if (!filteredPokemons.length) {
      window.addEventListener('scroll', handleScroll)   
    }
     
    return () => window.removeEventListener('scroll', handleScroll)
  }, [filteredPokemons, variables]) // eslint-disable-line

  const [pokemonTypes, setPokemonTypes] = React.useState<PokemonTypes[]>([])

  React.useEffect(() => {
    if (pokemons) {
      const types: string[] = []

      pokemons.forEach((item: PokemonsModel) => {
        item.types.forEach((type: string) => {
          types.push(type)
        })
      })

      const uniqueTypes = Array.from(new Set(types)).map(item => ({
        type: item,
        isActive: false
      }))

      setPokemonTypes(uniqueTypes)
    }
  }, [pokemons])

  const [visibilityFilter, setVisibilityFilter] = React.useState(false)

  function handleVisibilityFilter (visibility: boolean) {
    if (visibility) {
      document.body.classList.add('overflow-y-hidden')
    } else {
      document.body.classList.remove('overflow-y-hidden')
    }
    
    setVisibilityFilter(visibility)
  }

  const [filterPokemons, setFilterPokemons] = React.useState<string[]>([])

  function handleFilter (index: number) {
    const types: PokemonTypes[] = pokemonTypes
    types[index].isActive = !types[index].isActive

    setPokemonTypes([...types])

    const filter: string[] = []
    
    types.forEach((item: PokemonTypes) => {
      if (item.isActive) {
        filter.push(item.type)
      }
    })

    setFilterPokemons(filter)
    setLoadMore(false)
  }

  function handleApplyFilter () {
    const filtered: PokemonsModel[] = []

    pokemons.forEach((item: PokemonsModel) => item.types.forEach(type => {
      if (filterPokemons.includes(type)) {
        filtered.push(item)
      }
    }))

    const uniqueFiltered: any = Array.from(new Set(filtered.map((item: PokemonsModel) => item.id))).map(id => filtered.find(item => item.id === id))

    setFilteredPokemons(uniqueFiltered)
    handleVisibilityFilter(false)
  }

  function handleResetFilter () {
    const types: PokemonTypes[] = pokemonTypes.map((item: PokemonTypes) => ({
      ...item,
      isActive: false
    }))

    setPokemonTypes([...types])
    setFilterPokemons([])
    setFilteredPokemons([])
  }

  if (loading && !loadMore) return <PLoading mode="full" />
  if (error) return <PError />

  return (
    <div>
      <PPageHeader title="Pokémons" />

      <Row 
        gutter={[16, 16]}
        className="mt-12"
      >
        {!filteredPokemons.length ? (
          pokemons.map((item: PokemonsModel) => (
            <Col 
              key={item.id}
              span={12}
            >
              <Link 
                to={`/detail/${item.id}/${item.name}`}
                className="no-underline"
              >
                <PCard
                  bodyStyle={{ width: '100%' }}
                  cover={
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-auto p-4 h-40"
                    />
                  }
                >
                  <h2 className="title">
                    {item.name}
                  </h2>

                  <p className="text-gray-500">
                    {item.classification}
                  </p>

                  <Divider className="my-4" />

                  {item.types.map(type => (
                    <Tag
                      key={`type-${type}`}
                      color={colors.green[500]}
                    >
                      {type}
                    </Tag>
                  ))}
                </PCard>
              </Link>
            </Col>
          ))
        ) : (
          filteredPokemons.map((item: PokemonsModel) => (
            <Col 
              key={item.id}
              span={12}
            >
              <Link 
                to={`/detail/${item.id}/${item.name}`}
                className="no-underline"
              >
                <PCard
                  bodyStyle={{ width: '100%' }}
                  cover={
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-auto p-4 h-40"
                    />
                  }
                >
                  <h2 className="title">
                    {item.name}
                  </h2>

                  <p className="text-gray-500">
                    {item.classification}
                  </p>

                  <Divider className="my-4" />

                  {item.types.map(type => (
                    <Tag
                      key={`type-${type}`}
                      color={colors.green[500]}
                    >
                      {type}
                    </Tag>
                  ))}
                </PCard>
              </Link>
            </Col>
          ))
        )}

        {loadMore && <PLoading />}
      </Row>

      <POverlay
        position="bottom"
        className="z-10"
      >
        <PContainer className="flex justify-center">
          <Button
            type="primary"
            shape="round"
            icon={<FilterOutlined />}
            className="flex items-center"
            onClick={() => handleVisibilityFilter(true)}
          >
            Filter
          </Button>
        </PContainer>
      </POverlay>

      {visibilityFilter && (
        <POverlay
          position="top"
          mode="full"
          className="bg-white z-20 overflow-y-scroll"
        >
          <PContainer className="-mx-1 mt-12 mb-16">
            <PPageHeader
              title="Filter"
              onBack={() => handleVisibilityFilter(false)}
              extra={[
                <Button 
                  key="1" 
                  type="link"
                  className="text-white"
                  onClick={() => handleResetFilter()}
                >
                  Reset
                </Button>
              ]}
            />

            {pokemonTypes.map((item: PokemonTypes, index: number) => (
              !item.isActive ? (
                <div className="inline-block m-1">
                  <Button
                    key={`${item.type}-type`}
                    shape="round"
                    onClick={() => handleFilter(index)}
                  >
                    {item.type}
                  </Button>
                </div>
              ) : (
                <div className="inline-block m-1">
                  <Button
                    key={`${item.type}-type`}
                    shape="round"
                    className="flex items-center text-blue-500 border-blue-500"
                    icon={<CheckOutlined />}
                    onClick={() => handleFilter(index)}
                  >
                    {item.type}
                  </Button>
                </div>
              )
            ))}

            <POverlay
              position="bottom"
              className="z-10 bg-white shadow"
            >
              <PContainer className="flex justify-center">
                <Button
                  type="primary"
                  className="w-full"
                  onClick={() => handleApplyFilter()}
                >
                  Apply Filter
                </Button>
              </PContainer>
            </POverlay>
          </PContainer>
        </POverlay>
      )}
    </div>
  )
}
